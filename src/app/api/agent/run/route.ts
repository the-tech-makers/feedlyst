import { NextResponse } from "next/server";
import { AutonomousAgent } from "@/lib/agent/orchestrator";
import { agentModel } from "@/lib/agent/model";
import { createGitHubTools } from "@/lib/agent/github-adapter";
import { createVercelTools } from "@/lib/agent/vercel-adapter";
import { autonomousAgentPolicy } from "@/lib/agent/policy";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(request: Request) {
  const configured = process.env.AGENT_RUN_TOKEN;
  return Boolean(configured) && request.headers.get("authorization") === `Bearer ${configured}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    goal?: string;
    branch?: string;
  };

  if (!body.goal) {
    return NextResponse.json({ error: "goal is required" }, { status: 400 });
  }

  const tools = new Map([
    ...createGitHubTools(),
    ...createVercelTools(),
  ]);

  const branch = body.branch ?? `agent/autonomous-${Date.now()}`;
  await tools.get("repository.create_branch")!.execute({ branch, base: "main" });

  const inspected = await tools.get("repository.inspect")!.execute({
    branch,
  });

  const agent = new AutonomousAgent(agentModel, tools, autonomousAgentPolicy);
  const events = await agent.run({
    goal: body.goal,
    branch,
    repositorySummary: JSON.stringify(inspected),
  });

  return NextResponse.json({
    branch,
    events,
    completed: events.some((event) => event.type === "complete"),
    approvalRequired: events.find((event) => event.type === "approval") ?? null,
  });
}
