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
  const normalizedPath = candidate.path.replace(/\\/g, "/").toLowerCase();
  const protectedPath =
    normalizedPath.startsWith(".github/workflows/") ||
    normalizedPath === ".github/workflows" ||
    normalizedPath.startsWith("src/lib/agent/") ||
    normalizedPath === "src/lib/agent" ||
    normalizedPath.startsWith("src/app/api/agent/") ||
    normalizedPath === "src/app/api/agent" ||
    normalizedPath === "middleware.ts" ||
    normalizedPath === "src/middleware.ts" ||
    normalizedPath === "package.json" ||
    normalizedPath === "prisma/schema.prisma" ||
    normalizedPath.startsWith(".env") ||
    /(^|\/)(package-lock\\.json|npm-shrinkwrap\\.json|pnpm-lock\\.yaml|yarn\\.lock)$/.test(normalizedPath);
  if (protectedPath) {
    throw new Error(`Autonomous edits are not permitted for protected configuration or safety file: ${candidate.path}`);
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

function inspectablePath(path: string) {
  if (path.startsWith(".env") || path.includes("lock")) return false;
  return /\.(ts|tsx|js|jsx|json|md|yml|yaml|css|prisma|mjs|cjs)$/.test(path);
}

function scorePath(path: string, keywords: string[]) {
  const normalized = path.toLowerCase();
  return keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? keyword.length : 0), 0);
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
      const objective = typeof input.objective === "string" ? input.objective : "";
      const ref = await github(`/git/ref/heads/${encodePath(branch)}`);
      const commit = await github(`/git/commits/${encodeURIComponent(ref.object.sha)}`);
      const [repoInfo, tree] = await Promise.all([
        github(""),
        github(`/git/trees/${encodeURIComponent(commit.tree.sha)}?recursive=1`),
      ]);
      const paths = Array.isArray(tree.tree)
        ? tree.tree.filter((x: { type?: string }) => x.type === "blob").map((x: { path: string }) => x.path)
        : [];

      const keywords = objective.toLowerCase().match(/[a-z][a-z0-9_-]{2,}/g) ?? [];
      const ignored = new Set(["the", "and", "for", "with", "from", "into", "that", "this", "task", "make", "build", "improve", "update", "fix", "implement", "change", "existing"]);
      const relevantKeywords = [...new Set(keywords.filter((word) => !ignored.has(word)))];
      const candidates = objective.trim()
        ? paths
            .filter(inspectablePath)
            .map((path: string) => ({
              path,
              score: scorePath(path, relevantKeywords) +
                (path === "package.json" || path === "tsconfig.json" || path === "AGENT.md" ? 2 : 0),
            }))
            .sort((a: { path: string; score: number }, b: { path: string; score: number }) =>
              b.score - a.score || a.path.localeCompare(b.path),
            )
            .slice(0, 12)
        : [];

      const files: Array<{ path: string; content: string; truncated?: boolean }> = [];
      let totalChars = 0;
      for (const candidate of candidates) {
        if (totalChars >= 50000) break;
        try {
          const file = await github(
            `/contents/${encodePath(candidate.path)}?ref=${encodeURIComponent(branch)}`,
          );
          if (typeof file.content !== "string" || file.encoding !== "base64") continue;
          const decoded = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
          const remaining = 50000 - totalChars;
          const content = decoded.slice(0, Math.min(8000, remaining));
          files.push({ path: candidate.path, content, ...(content.length < decoded.length ? { truncated: true } : {}) });
          totalChars += content.length;
        } catch {
          // A file that disappears or cannot be read should not prevent repository inspection.
        }
      }

      return { branch, defaultBranch: repoInfo.default_branch, name: repoInfo.full_name, paths, files };
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

      // Agent edits push commits directly to an agent/* branch. Wait for the push-triggered
      // CI run for the exact branch head instead of assuming a pull request already exists.
      const workflows = await github("/actions/workflows");
      const target = workflows.workflows?.find((w: { name: string }) => w.name === "CI");
      if (!target) throw new Error("CI workflow not found on the repository default branch.");

      const ref = await github(`/git/ref/heads/${encodePath(branch)}`);
      const headSha = ref.object?.sha;
      if (typeof headSha !== "string" || !headSha) {
        throw new Error(`Could not resolve the latest commit for branch: ${branch}`);
      }

      for (let attempt = 0; attempt < 300; attempt++) {
        const runs = await github(
          `/actions/workflows/${target.id}/runs?branch=${encodeURIComponent(branch)}&event=push&per_page=20`,
        );
        const run = (runs.workflow_runs ?? []).find(
          (candidate: { head_sha?: string }) => candidate.head_sha === headSha,
        );
        if (run?.status === "completed") {
          return {
            passed: run.conclusion === "success",
            details: `CI workflow ${run.conclusion}. Run ${run.id}; commit ${headSha.slice(0, 7)}.`,
            workflowRunId: run.id,
            commitSha: headSha,
          };
        }
        if (run?.status === "in_progress" || run?.status === "queued") {
          // Continue polling the same commit until CI completes.
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      return {
        passed: false,
        details: `CI did not complete for commit ${headSha.slice(0, 7)} within 600 seconds.`,
        commitSha: headSha,
      };
    },
  });

  return tools;
}
