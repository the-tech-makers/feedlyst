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

export class AutonomousAgent {
  constructor(
    private readonly model: AgentModel,
    private readonly tools: Map<AgentToolName, AgentTool>,
    private readonly policy: AgentPolicy = {
      maxAttemptsPerTask: 3,
      approvals: new Set([
        "production_deploy",
        "destructive_migration",
        "substantial_delete",
        "billing_or_credentials",
        "ambiguous_requirement",
        "repeated_failure",
      ]),
    },
  ) {}

  async run(input: {
    goal: string;
    repositorySummary: string;
    completedTasks?: AgentTask[];
  }): Promise<AgentEvent[]> {
    const events: AgentEvent[] = [];
    const completedTasks = input.completedTasks ?? [];

    const plan = await this.model.plan({
      goal: input.goal,
      repositorySummary: input.repositorySummary,
      completedTasks,
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
      return events;
    }

    events.push({ type: "plan", taskId: task.id, summary: task.objective });
    task.status = "RUNNING";

    for (task.attempts = 1; task.attempts <= this.policy.maxAttemptsPerTask; task.attempts++) {
      const action = await this.executeTask(task);
      events.push({ type: "action", taskId: task.id, action: action.summary });

      const testResult = await this.tools.get("tests.run")?.execute({ taskId: task.id });
      if (!testResult) throw new Error("tests.run tool is not configured");

      const testsPassed = testResult.passed === true;
      events.push({
        type: "test",
        taskId: task.id,
        passed: testsPassed,
        details: String(testResult.details ?? ""),
      });

      const diff = String(
        (await this.tools.get("repository.diff")?.execute({ taskId: task.id }))?.diff ?? "",
      );
      const review = await this.model.review({ task, diff, testResult });
      events.push({ type: "review", taskId: task.id, ...review });

      if (testsPassed && review.passed) {
        task.status = "PASSED";
        events.push({ type: "complete", taskId: task.id });
        return events;
      }

      if (task.attempts === this.policy.maxAttemptsPerTask) {
        events.push({ type: "approval", taskId: task.id, reason: "repeated_failure" });
        return events;
      }

      await this.tools.get("repository.edit")?.execute({
        taskId: task.id,
        findings: review.findings,
        testDetails: testResult.details,
      });
    }

    return events;
  }

  private async executeTask(task: AgentTask): Promise<{ summary: string }> {
    const inspect = await this.tools.get("repository.inspect")?.execute({
      taskId: task.id,
      objective: task.objective,
    });
    if (!inspect) throw new Error("repository.inspect tool is not configured");

    const edit = await this.tools.get("repository.edit")?.execute({
      taskId: task.id,
      objective: task.objective,
      repository: inspect,
    });
    if (!edit) throw new Error("repository.edit tool is not configured");

    const commit = await this.tools.get("repository.commit")?.execute({
      taskId: task.id,
      changes: edit,
    });
    if (!commit) throw new Error("repository.commit tool is not configured");

    return { summary: String(commit.summary ?? "Changes committed") };
  }
}
