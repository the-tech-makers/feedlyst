import "server-only";

import type { AgentTool } from "./orchestrator";

const repo = process.env.AGENT_GITHUB_REPOSITORY ?? "the-tech-makers/feedlyst";
const token = process.env.AGENT_GITHUB_TOKEN;

function requireToken() {
  if (!token) throw new Error("AGENT_GITHUB_TOKEN is not configured.");
  return token;
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function validateEdit(edit: unknown): asserts edit is { path: string; content: string; message?: string } {
  if (!edit || typeof edit !== "object") throw new Error("Each repository edit must be an object.");
  const candidate = edit as { path?: unknown; content?: unknown; message?: unknown };
  if (typeof candidate.path !== "string" || !candidate.path.trim()) {
    throw new Error("Each repository edit requires a file path.");
  }
  if (
    candidate.path.startsWith("/") ||
    candidate.path.includes("\\") ||
    candidate.path.split("/").some((part) => !part || part === "." || part === "..") ||
    candidate.path.includes("\0")
  ) {
    throw new Error(`Unsafe repository edit path: ${candidate.path}`);
  }
  if (typeof candidate.content !== "string") {
    throw new Error(`Repository edit content must be text: ${candidate.path}`);
  }
  if (candidate.message !== undefined && typeof candidate.message !== "string") {
    throw new Error(`Repository edit message must be text: ${candidate.path}`);
  }
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

  tools.set("repository.create_branch", {
    name: "repository.create_branch",
    async execute(input) {
      const branch = typeof input.branch === "string" ? input.branch.trim() : "";
      const base = typeof input.base === "string" ? input.base : "main";
      if (!branch || branch.startsWith("/") || branch.endsWith("..") || branch.includes("..")) {
        throw new Error("repository.create_branch requires a valid branch name.");
      }
      const ref = await github(`/git/ref/heads/${encodePath(base)}`);
      const created = await github("/git/refs", {
        method: "POST",
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: ref.object.sha }),
      });
      return { branch, sha: created.object?.sha ?? ref.object.sha };
    },
  });

  tools.set("repository.inspect", {
    name: "repository.inspect",
    async execute(input) {
      const branch = typeof input.branch === "string" && input.branch ? input.branch : "main";
      const [repoInfo, tree] = await Promise.all([
        github(""),
        github(`/git/trees/${encodePath(branch)}?recursive=1`),
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
      const branch = typeof input.branch === "string" ? input.branch : "";
      const edits = Array.isArray(input.edits) ? input.edits : [];
      if (!branch) throw new Error("repository.edit requires a branch.");
      if (edits.length === 0 || edits.length > 20) {
        throw new Error("repository.edit requires between 1 and 20 file edits.");
      }

      const results = [];
      for (const candidate of edits) {
        validateEdit(candidate);
        const edit = candidate;
        const path = encodePath(edit.path);
        let existingSha: string | undefined;
        try {
          const existing = await github(`/contents/${path}?ref=${encodeURIComponent(branch)}`);
          existingSha = typeof existing.sha === "string" ? existing.sha : undefined;
        } catch (error) {
          if (!(error instanceof Error) || !error.message.startsWith("GitHub 404:")) throw error;
        }

        const payload: Record<string, unknown> = {
          message: edit.message ?? "chore: autonomous agent change",
          content: Buffer.from(edit.content, "utf8").toString("base64"),
          branch,
        };
        if (existingSha) payload.sha = existingSha;
        const result = await github(`/contents/${path}`, {
          method: "PUT",
          body: JSON.stringify(payload),
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
      const base = typeof input.base === "string" && input.base ? input.base : "main";
      const head = typeof input.branch === "string" ? input.branch : "";
      if (!head) throw new Error("repository.diff requires a branch.");
      const result = await github(`/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`);
      return {
        diff: result.files
          ?.map((f: { filename: string; patch?: string }) => `FILE ${f.filename}\n${f.patch ?? "[patch unavailable]"}`)
          .join("\n") ?? "",
        changedFiles: result.files?.length ?? 0,
        status: result.status,
      };
    },
  });

  tools.set("tests.run", {
    name: "tests.run",
    async execute(input) {
      const branch = typeof input.branch === "string" ? input.branch : "";
      if (!branch) throw new Error("tests.run requires a branch.");

      const workflow = "Agent Verify";
      const workflows = await github("/actions/workflows");
      const target = workflows.workflows?.find((w: { name: string }) => w.name === workflow);
      if (!target) throw new Error("Agent Verify workflow not found.");

      const before = await github(
        `/actions/workflows/${target.id}/runs?branch=${encodeURIComponent(branch)}&per_page=20`,
      );
      const known = new Set((before.workflow_runs ?? []).map((run: { id: number }) => run.id));

      await github(`/actions/workflows/${target.id}/dispatches`, {
        method: "POST",
        body: JSON.stringify({ ref: branch, inputs: { ref: branch } }),
      });

      for (let attempt = 0; attempt < 45; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const runs = await github(
          `/actions/workflows/${target.id}/runs?branch=${encodeURIComponent(branch)}&per_page=20`,
        );
        const run = (runs.workflow_runs ?? []).find(
          (candidate: { id: number }) => !known.has(candidate.id),
        );
        if (!run) continue;

        if (run.status === "completed") {
          return {
            passed: run.conclusion === "success",
            details: `Agent Verify workflow ${run.conclusion}. Run ${run.id}.`,
            workflowRunId: run.id,
          };
        }
      }

      return {
        passed: false,
        details: "Agent Verify workflow did not complete within 90 seconds.",
        workflowDispatched: true,
      };
    },
  });

  return tools;
}
