import "server-only";

import type { AgentModel } from "./orchestrator";

type ModelResponse = {
  task: {
    title: string;
    objective: string;
  };
  requiresApproval?: "production_deploy" | "destructive_migration" | "substantial_delete" |
    "billing_or_credentials" | "ambiguous_requirement" | "repeated_failure";
};

async function complete(prompt: string): Promise<ModelResponse> {
  const baseUrl = process.env.AGENT_MODEL_BASE_URL;
  const apiKey = process.env.AGENT_MODEL_API_KEY;
  const model = process.env.AGENT_MODEL_NAME;

  if (!baseUrl || !apiKey || !model) {
    throw new Error(
      "Agent model is not configured. Set AGENT_MODEL_BASE_URL, AGENT_MODEL_API_KEY, and AGENT_MODEL_NAME.",
    );
  }

  const response = await fetch(baseUrl.replace(/\/$/, "") + "/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the planning model for an autonomous software engineering agent. Return only valid JSON matching the requested shape. Do not request production or destructive actions without explicitly setting requiresApproval.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent model request failed: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Agent model returned no content.");

  return JSON.parse(content) as ModelResponse;
}

export const agentModel: AgentModel = {
  async plan(input) {
    return complete(`Plan exactly one next engineering task.

Goal:
${input.goal}

Repository summary:
${input.repositorySummary}

Completed tasks:
${JSON.stringify(input.completedTasks)}

Previous failures:
${JSON.stringify(input.failedAttempts)}

Return JSON:
{
  "task": {
    "title": "short task title",
    "objective": "specific, testable engineering objective"
  },
  "requiresApproval": null
}

Use requiresApproval only when the next task itself needs human approval.`);
  },

  async review(input) {
    const result = await complete(`Review one autonomous engineering task.

Task:
${JSON.stringify(input.task)}

Diff:
${input.diff}

Test result:
${JSON.stringify(input.testResult)}

Return JSON:
{
  "task": {
    "title": "review",
    "objective": "review"
  },
  "requiresApproval": null
}

For this review response, encode pass/fail and findings in the objective as:
PASS: <finding summary>
or
FAIL: <finding 1>; <finding 2>

Do not approve unsafe or out-of-scope changes.`);

    const objective = result.task.objective;
    const passed = objective.startsWith("PASS:");
    return {
      passed,
      findings: objective.replace(/^(PASS|FAIL):\s*/, "").split(";").filter(Boolean),
    };
  },
};
