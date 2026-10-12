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

function previewUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("A preview deployment URL is required.");
  }
  const url = new URL(value.startsWith("https://") ? value : `https://${value}`);
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".vercel.app") ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new Error("Preview verification is restricted to HTTPS Vercel preview domains.");
  }
  return url;
}

export function createVercelTools(): Map<AgentTool["name"], AgentTool> {
  const tools = new Map<AgentTool["name"], AgentTool>();

  tools.set("deployment.create_preview", {
    name: "deployment.create_preview",
    async execute(input) {
      const branch = typeof input.branch === "string" ? input.branch : "";
      if (!branch) throw new Error("deployment.create_preview requires a branch.");

      let latestDeployment: Record<string, unknown> | undefined;
      for (let attempt = 0; attempt < 45; attempt++) {
        const result = await vercel(
          `/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=20`,
        );
        const matching = (result.deployments ?? [])
          .filter(
            (item: { meta?: { githubCommitRef?: string }; target?: string }) =>
              item.meta?.githubCommitRef === branch && item.target !== "production",
          )
          .sort((a: { created?: number }, b: { created?: number }) => (b.created ?? 0) - (a.created ?? 0));

        if (matching.length > 0) {
          latestDeployment = matching[0] as Record<string, unknown>;
          const state = String(latestDeployment.state ?? latestDeployment.readyState ?? "").toUpperCase();
          if (["READY", "ERROR", "CANCELED", "CANCELLED", "BLOCKED"].includes(state)) {
            return { deployment: latestDeployment };
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (latestDeployment) return { deployment: latestDeployment };
      throw new Error("No Vercel preview deployment appeared for the agent branch within 90 seconds.");
    },
  });

  tools.set("deployment.inspect", {
    name: "deployment.inspect",
    async execute(input) {
      const deploymentId = typeof input.deploymentId === "string" ? input.deploymentId : "";
      if (!deploymentId) throw new Error("deployment.inspect requires a deployment ID.");
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
      const url = previewUrl(input.url);
      const response = await fetch(url, { redirect: "manual" });
      const html = await response.text();
      const redirectIsSafe = response.status < 300 || response.status >= 400;
      return {
        passed: response.ok && redirectIsSafe,
        status: response.status,
        details: `Preview returned HTTP ${response.status}; received ${html.length} bytes.`,
      };
    },
  });

  return tools;
}
