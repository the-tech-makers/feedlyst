import "server-only";

import type { AgentTool } from "./orchestrator";

const projectId = process.env.AGENT_VERCEL_PROJECT_ID ?? "prj_JU34v3V6hWTy5NrSL0Mokv00wQsS";
const teamId = process.env.AGENT_VERCEL_TEAM_ID ?? "team_1pvNCaZxpbbLFHTWqqKc7gPM";
const token = process.env.AGENT_VERCEL_TOKEN;

async function vercel(path: string) {
  if (!token) throw new Error("AGENT_VERCEL_TOKEN is not configured.");
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(
    `https://api.vercel.com${path}${separator}teamId=${encodeURIComponent(teamId)}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  const text = await response.text();
  if (!response.ok) throw new Error(`Vercel ${response.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

export function createVercelTools(): Map<AgentTool["name"], AgentTool> {
  const tools = new Map<AgentTool["name"], AgentTool>();

  tools.set("deployment.create_preview", {
    name: "deployment.create_preview",
    async execute(input) {
      const branch = String(input.branch);
      for (let attempt = 0; attempt < 30; attempt++) {
        const result = await vercel(`/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=20`);
        const deployment = (result.deployments ?? []).find(
          (item: { meta?: { githubCommitRef?: string }; target?: string }) =>
            item.meta?.githubCommitRef === branch && item.target !== "production",
        );
        if (deployment) return { deployment };
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      throw new Error("No Vercel preview deployment appeared for the agent branch.");
    },
  });

  tools.set("deployment.inspect", {
    name: "deployment.inspect",
    async execute(input) {
      const deploymentId = String(input.deploymentId);
      const result = await vercel(`/v13/deployments/${encodeURIComponent(deploymentId)}`);
      return {
        id: result.id,
        url: result.url,
        state: result.readyState ?? result.state,
        target: result.target,
      };
    },
  });

  tools.set("deployment.verify", {
    name: "deployment.verify",
    async execute(input) {
      const url = String(input.url);
      const response = await fetch(`https://${url}`);
      const html = await response.text();
      return {
        passed: response.ok,
        status: response.status,
        details: `Preview returned HTTP ${response.status}; received ${html.length} bytes.`,
      };
    },
  });

  return tools;
}
