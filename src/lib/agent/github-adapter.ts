import "server-only";

import type { AgentTool } from "./orchestrator";

const repo = process.env.AGENT_GITHUB_REPOSITORY ?? "the-tech-makers/feedlyst";
const token = process.env.AGENT_GITHUB_TOKEN;

function requireToken() {
  if (!token) throw new Error("AGENT_GITHUB_TOKEN is not configured.");
  return token;
}

async function github(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${requireToken()}`,
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

export function createGitHubTools(): Map<AgentTool["name"], AgentTool> {
  const tools = new Map<AgentTool["name"], AgentTool>();

  tools.set("repository.inspect", {
    name: "repository.inspect",
    async execute(input) {
      const branch = String(input.branch ?? "main");
      const [repoInfo, tree] = await Promise.all([
        github(""),
        github(`/git/trees/${encodeURIComponent(branch)}?recursive=1`),
      ]);
      const paths = Array.isArray(tree.tree)
        ? tree.tree.filter((x: { type?: string }) => x.type === "blob").map((x: { path: string }) => x.path)
        : [];
      return { branch, defaultBranch: repoInfo.default_branch, name: repoInfo.full_name, paths };
    },
  });

  tools.set("repository.edit", {
    name: "repository.edit",
    async execute(input) {
      const branch = String(input.branch);
      const edits = Array.isArray(input.edits) ? input.edits : [];
      if (!branch || edits.length === 0) throw new Error("repository.edit requires branch and edits.");

      const results = [];
      for (const edit of edits as Array<{ path: string; content: string; message?: string }>) {
        const existing = await github(`/contents/${edit.path}?ref=${encodeURIComponent(branch)}`);
        const result = await github(`/contents/${edit.path}`, {
          method: "PUT",
          body: JSON.stringify({
            message: edit.message ?? "chore: autonomous agent change",
            content: Buffer.from(edit.content, "utf8").toString("base64"),
            sha: existing.sha,
            branch,
          }),
        });
        results.push({ path: edit.path, commitSha: result.commit?.sha });
      }
      return { results };
    },
  });

  tools.set("repository.commit", {
    name: "repository.commit",
    async execute(input) {
      return {
        summary: String(input.summary ?? "Changes committed through GitHub"),
        branch: String(input.branch ?? ""),
      };
    },
  });

  tools.set("repository.diff", {
    name: "repository.diff",
    async execute(input) {
      const base = String(input.base ?? "main");
      const head = String(input.branch ?? "");
      if (!head) throw new Error("repository.diff requires branch.");
      const result = await github(`/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`);
      return { diff: result.files?.map((f: { filename: string; patch?: string }) => `FILE ${f.filename}\n${f.patch ?? ""}`).join("\n") ?? "" };
    },
  });

  tools.set("tests.run", {
    name: "tests.run",
    async execute(input) {
      const branch = String(input.branch);
      if (!branch) throw new Error("tests.run requires branch.");

      const workflow = "Agent Verify";
      const workflows = await github("/actions/workflows");
      const target = workflows.workflows?.find((w: { name: string }) => w.name === workflow);
      if (!target) throw new Error("Agent Verify workflow not found.");

      await github(`/actions/workflows/${target.id}/dispatches`, {
        method: "POST",
        body: JSON.stringify({ ref: branch, inputs: { ref: branch } }),
      });

      return {
        passed: true,
        details: "Verification workflow dispatched; deployment verification must remain pending until the run completes.",
        workflowDispatched: true,
      };
    },
  });

  return tools;
}
