import { NextResponse } from "next/server";
import { agentModel } from "@/lib/agent/model";

export const runtime = "nodejs";

function authorized(request: Request) {
  const configured = process.env.AGENT_RUN_TOKEN;
  if (!configured) return false;
  return request.headers.get("authorization") === `Bearer ${configured}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    goal?: string;
    repositorySummary?: string;
    completedTasks?: unknown[];
  };

  if (!body.goal || !body.repositorySummary) {
    return NextResponse.json(
      { error: "goal and repositorySummary are required" },
      { status: 400 },
    );
  }

  const plan = await agentModel.plan({
    goal: body.goal,
    repositorySummary: body.repositorySummary,
    completedTasks: Array.isArray(body.completedTasks) ? body.completedTasks as never[] : [],
    failedAttempts: [],
  });

  return NextResponse.json({
    plan,
    policy: {
      productionDeploymentRequiresApproval: true,
      destructiveMigrationRequiresApproval: true,
      repeatedFailureRequiresApproval: true,
    },
  });
}
