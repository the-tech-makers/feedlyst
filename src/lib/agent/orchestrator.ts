import "server-only";

export type AgentApproval =
  | "production_deploy"
  | "destructive_migration"
  | "substantial_delete"
  | "billing_or_credentials"
  | "ambiguous_requirement"
  | "repeated_failure";

export type AgentTaskStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "BLOCKED";

export type AgentTask = {
  id: string;
  title: string;
  objective: string;
  status: AgentTaskStatus;
  attempts: number;
  approvals: AgentApproval[];
};

export type AgentEvent =
  | { type: "plan"; taskId: string; summary: string }
  | { type: "action"; taskId: string; action: string }
  | { type: "test"; taskId: string; passed: boolean; details: string }
  | { type: "review"; taskId: string; passed: boolean; findings: string[] }
  | { type: "approval"; taskId: string; reason: AgentApproval }
  | { type: "complete"; taskId: string };

export type AgentToolName =
  | "repository.create_branch"
  | "repository.inspect"
  | "repository.edit"
  | "repository.commit"
  | "repository.diff"
  | "tests.run"
  | "deployment.create_preview"
  | "deployment.inspect"
  | "deployment.verify";

export interface AgentTool {
  name: AgentToolName;
  execute(input: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export interface AgentModel {
  plan(input: {
    goal: string;
    repositorySummary: string;
    completedTasks: AgentTask[];
    failedAttempts: AgentEvent[];
  }): Promise<{
    task: Omit<AgentTask, "id" | "status" | "attempts" | "approvals">;
    requiresApproval?: AgentApproval;
  }>;
  implement(input: {
    task: AgentTask;
    repository: Record<string, unknown>;
    findings?: string[];
    testDetails?: string;
  }): Promise<{ edits: Array<{ path: string; content: string; message?: string }>; summary: string }>;
  review(input: {
    task: AgentTask;
    diff: string;
    testResult: Record<string, unknown>;
  }): Promise<{ passed: boolean; findings: string[] }>;
}

export interface AgentPolicy {
  maxAttemptsPerTask: number;
  approvals: Set<AgentApproval>;
}

const defaultPolicy: AgentPolicy = {
  maxAttemptsPerTask: 3,
  approvals: new Set([
    "production_deploy",
    "destructive_migration",
    "substantial_delete",
    "billing_or_credentials",
    "ambiguous_requirement",
    "repeated_failure",
  ]),
};

export class AutonomousAgent {
  constructor(
    private readonly model: AgentModel,
    private readonly tools: Map<AgentToolName, AgentTool>,
    private readonly policy: AgentPolicy = defaultPolicy,
  ) {}

  private async runTool(name: AgentToolName, input: Record<string, unknown>) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Required agent tool is not configured: ${name}`);
    return tool.execute(input);
  }

  async run(input: {
    goal: string;
    repositorySummary: string;
    completedTasks?: AgentTask[];
    branch: string;
  }): Promise<AgentEvent[]> {
    if (!input.branch.trim()) throw new Error("A target branch is required.");
    if (!input.goal.trim()) throw new Error("A goal is required.");
    if (this.policy.maxAttemptsPerTask < 1) throw new Error("maxAttemptsPerTask must be at least 1.");

    const events: AgentEvent[] = [];
    const plan = await this.model.plan({
      goal: input.goal,
      repositorySummary: input.repositorySummary,
      completedTasks: input.completedTasks ?? [],
      failedAttempts: events,
    });

    const task: AgentTask = {
      ...plan.task,
      id: crypto.randomUUID(),
      status: "PENDING",
      attempts: 0,
      approvals: plan.requiresApproval ? [plan.requiresApproval] : [],
    };

    if (plan.requiresApproval && this.policy.approvals.has(plan.requiresApproval)) {
      events.push({ type: "approval", taskId: task.id, reason: plan.requiresApproval });
      task.status = "BLOCKED";
      return events;
    }

    events.push({ type: "plan", taskId: task.id, summary: task.objective });
    task.status = "RUNNING";
    let lastFindings: string[] = [];
    let lastTestDetails = "";

    for (let attempt = 1; attempt <= this.policy.maxAttemptsPerTask; attempt++) {
      task.attempts = attempt;

      if (attempt === 1) {
        const action = await this.executeTask(task, input.branch);
        events.push({ type: "action", taskId: task.id, action: action.summary });
      } else {
        // Remediate the previous attempt instead of re-running the original implementation.
        const repository = await this.runTool("repository.inspect", {
          taskId: task.id,
          objective: task.objective,
          branch: input.branch,
        });
        const implementation = await this.model.implement({
          task,
          repository,
          findings: lastFindings,
          testDetails: lastTestDetails,
        });
        if (implementation.edits.length === 0) {
          lastFindings = ["The remediation model returned no file edits.", ...lastFindings];
        } else {
          await this.runTool("repository.edit", {
            taskId: task.id,
            branch: input.branch,
            edits: implementation.edits,
            summary: implementation.summary,
          });
          events.push({ type: "action", taskId: task.id, action: implementation.summary });
        }
      }

      const testResult = await this.runTool("tests.run", {
        taskId: task.id,
        branch: input.branch,
      });
      const testsPassed = testResult.passed === true;
      lastTestDetails = String(testResult.details ?? "No test details were returned.");
      events.push({
        type: "test",
        taskId: task.id,
        passed: testsPassed,
        details: lastTestDetails,
      });

      const diffResult = await this.runTool("repository.diff", {
        taskId: task.id,
        base: "main",
        branch: input.branch,
      });
      const diff = String(diffResult.diff ?? "");
      const review = await this.model.review({ task, diff, testResult });
      events.push({ type: "review", taskId: task.id, ...review });
      lastFindings = review.findings;

      if (testsPassed && review.passed) {
        const preview = await this.runTool("deployment.create_preview", { branch: input.branch });
        const previewDeployment = preview.deployment as Record<string, unknown> | undefined;
        const deploymentId = previewDeployment?.id;
        if (typeof deploymentId !== "string" || !deploymentId) {
          lastFindings = ["Preview lookup did not return a deployment ID."];
          lastTestDetails = lastFindings[0];
        } else {
          const deployment = await this.runTool("deployment.inspect", { deploymentId });
          const state = String(deployment.state ?? "").toUpperCase();
          const url = deployment.url;
          if (state !== "READY") {
            lastFindings = [`Preview deployment is not ready (state: ${state || "unknown"}).`];
            lastTestDetails = lastFindings[0];
          } else if (typeof url !== "string" || !url) {
            lastFindings = ["Preview deployment did not return a URL."];
            lastTestDetails = lastFindings[0];
          } else {
            const verification = await this.runTool("deployment.verify", { url });
            const verified = verification.passed === true;
            const details = String(verification.details ?? "Preview verification returned no details.");
            events.push({ type: "test", taskId: task.id, passed: verified, details });
            if (verified) {
              task.status = "PASSED";
              events.push({ type: "complete", taskId: task.id });
              return events;
            }
            lastFindings = [details];
            lastTestDetails = details;
          }
        }
        events.push({
          type: "test",
          taskId: task.id,
          passed: false,
          details: lastTestDetails,
        });
      }

      if (attempt === this.policy.maxAttemptsPerTask) {
        task.status = "BLOCKED";
        events.push({ type: "approval", taskId: task.id, reason: "repeated_failure" });
        return events;
      }

      if (!testsPassed && lastFindings.length === 0) {
        lastFindings = ["Automated verification failed. Review the test output and correct the implementation."];
      }
      if (testsPassed && !review.passed && lastFindings.length === 0) {
        lastFindings = ["Code review did not pass. Address the review findings before retrying."];
      }
    }

    task.status = "FAILED";
    return events;
  }

  private async executeTask(task: AgentTask, branch: string): Promise<{ summary: string }> {
    const repository = await this.runTool("repository.inspect", {
      taskId: task.id,
      objective: task.objective,
      branch,
    });
    const implementation = await this.model.implement({ task, repository });
    if (implementation.edits.length === 0) {
      throw new Error("The implementation model returned no file edits.");
    }
    const edit = await this.runTool("repository.edit", {
      taskId: task.id,
      branch,
      edits: implementation.edits,
      summary: implementation.summary,
    });
    const commit = await this.runTool("repository.commit", {
      taskId: task.id,
      branch,
      changes: edit,
      summary: implementation.summary,
    });
    return { summary: String(commit.summary ?? implementation.summary ?? "Changes committed") };
  }
}
