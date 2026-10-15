import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createGitHubTools } from "./github-adapter";

import {
  AutonomousAgent,
  type AgentModel,
  type AgentTool,
  type AgentToolName,
} from "./orchestrator";

function makeModel(overrides: Partial<AgentModel> = {}): AgentModel {
  return {
    async plan() {
      return {
        task: {
          title: "Add a focused regression test",
          objective: "Add one focused regression test and verify it",
        },
      };
    },
    async implement() {
      return {
        edits: [{ path: "src/example.test.ts", content: "test content" }],
        summary: "Added a focused regression test",
      };
    },
    async review() {
      return { passed: true, findings: [] };
    },
    ...overrides,
  };
}

function makeTools(overrides: Partial<Record<AgentToolName, (input: Record<string, unknown>) => Promise<Record<string, unknown>>>> = {}) {
  const defaults: Record<AgentToolName, (input: Record<string, unknown>) => Promise<Record<string, unknown>>> = {
    "repository.create_branch": async () => ({ branch: "agent/test" }),
    "repository.inspect": async () => ({ files: [] }),
    "repository.edit": async () => ({ changed: true }),
    "repository.commit": async () => ({ summary: "Committed test change" }),
    "repository.diff": async () => ({ diff: "diff --git a/src/example.test.ts b/src/example.test.ts" }),
    "tests.run": async () => ({ passed: true, details: "All checks passed" }),
    "deployment.create_preview": async () => ({ deployment: { id: "deployment-1" } }),
    "deployment.inspect": async () => ({ id: "deployment-1", state: "READY", url: "https://preview.vercel.app" }),
    "deployment.verify": async () => ({ passed: true, details: "Preview returned HTTP 200" }),
  };
  const tools = new Map<AgentToolName, AgentTool>();
  for (const [name, execute] of Object.entries({ ...defaults, ...overrides }) as [AgentToolName, (input: Record<string, unknown>) => Promise<Record<string, unknown>>][]) {
    tools.set(name, { name, execute });
  }
  return tools;
}

describe("GitHub agent adapter safety", () => {
  it("rejects edits to agent guardrails and CI configuration before making API calls", async () => {
    const tools = createGitHubTools();
    const edit = tools.get("repository.edit");
    expect(edit).toBeDefined();

    await expect(edit!.execute({
      branch: "agent/test",
      edits: [{ path: ".github/workflows/ci.yml", content: "name: disabled" }],
    })).rejects.toThrow("Autonomous edits are not permitted for protected configuration or safety file");

    await expect(edit!.execute({
      branch: "agent/test",
      edits: [{ path: "src/lib/agent/orchestrator.ts", content: "export {};" }],
    })).rejects.toThrow("Autonomous edits are not permitted for protected configuration or safety file");
  });
});

describe("AutonomousAgent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an empty goal before calling the model", async () => {
    const plan = vi.fn();
    const agent = new AutonomousAgent(makeModel({ plan }), makeTools());

    await expect(agent.run({ goal: " ", repositorySummary: "repo", branch: "agent/test" }))
      .rejects.toThrow("A goal is required.");
    expect(plan).not.toHaveBeenCalled();
  });

  it("rejects non-agent branches before calling the model", async () => {
    const plan = vi.fn();
    const agent = new AutonomousAgent(makeModel({ plan }), makeTools());

    await expect(agent.run({ goal: "Improve Feedlyst", repositorySummary: "repo", branch: "main" }))
      .rejects.toThrow("The autonomous agent may only operate on a dedicated agent/* branch.");
    expect(plan).not.toHaveBeenCalled();
  });

  it("stops when the plan requests a protected action", async () => {
    const agent = new AutonomousAgent(
      makeModel({
        async plan() {
          return {
            task: { title: "Deploy", objective: "Deploy to production" },
            requiresApproval: "production_deploy",
          };
        },
      }),
      makeTools(),
    );

    const events = await agent.run({
      goal: "Improve Feedlyst",
      repositorySummary: "repo",
      branch: "agent/test",
    });

    expect(events).toEqual([
      expect.objectContaining({ type: "approval", reason: "production_deploy" }),
    ]);
    expect(events.some((event) => event.type === "complete")).toBe(false);
  });

  it("requires approval for a production deployment even when the model omits the approval flag", async () => {
    const inspect = vi.fn(async () => ({ files: [] }));
    const agent = new AutonomousAgent(
      makeModel({
        async plan() {
          return {
            task: { title: "Deploy", objective: "Deploy to production" },
          };
        },
      }),
      makeTools({ "repository.inspect": inspect }),
    );

    const events = await agent.run({
      goal: "Improve Feedlyst",
      repositorySummary: "repo",
      branch: "agent/test",
    });

    expect(events).toEqual([
      expect.objectContaining({ type: "approval", reason: "production_deploy" }),
    ]);
    expect(inspect).not.toHaveBeenCalled();
  });

  it("only reports completion after checks, review, and preview verification pass", async () => {
    const verify = vi.fn(async () => ({ passed: true, details: "Preview returned HTTP 200" }));
    const agent = new AutonomousAgent(
      makeModel(),
      makeTools({ "deployment.verify": verify }),
    );

    const events = await agent.run({
      goal: "Improve Feedlyst",
      repositorySummary: "repo",
      branch: "agent/test",
    });

    expect(verify).toHaveBeenCalledWith({ url: "https://preview.vercel.app" });
    expect(events.at(-1)).toEqual(expect.objectContaining({ type: "complete" }));
  });

  it("retries after a transient test-runner exception instead of aborting the task", async () => {
    let testAttempts = 0;
    const implement = vi.fn(async () => ({
      edits: [{ path: "src/example.test.ts", content: "test content" }],
      summary: "Remediated the failed attempt",
    }));
    const agent = new AutonomousAgent(
      makeModel({ implement }),
      makeTools({
        "tests.run": async () => {
          testAttempts += 1;
          if (testAttempts === 1) throw new Error("Temporary CI API failure");
          return { passed: true, details: "Checks passed on retry" };
        },
      }),
    );

    const events = await agent.run({
      goal: "Improve Feedlyst",
      repositorySummary: "repo",
      branch: "agent/test",
    });

    expect(testAttempts).toBe(2);
    expect(implement).toHaveBeenCalledTimes(2);
    expect(events.some((event) => event.type === "test" && !event.passed && event.details.includes("Temporary CI API failure"))).toBe(true);
    expect(events.at(-1)).toEqual(expect.objectContaining({ type: "complete" }));
  });

  it("does not report completion when preview verification fails", async () => {
    const agent = new AutonomousAgent(
      makeModel(),
      makeTools({
        "deployment.verify": async () => ({ passed: false, details: "Preview returned HTTP 500" }),
      }),
    );

    const events = await agent.run({
      goal: "Improve Feedlyst",
      repositorySummary: "repo",
      branch: "agent/test",
    });

    expect(events.some((event) => event.type === "complete")).toBe(false);
    expect(events.some((event) => event.type === "approval" && event.reason === "repeated_failure")).toBe(true);
  });
});
