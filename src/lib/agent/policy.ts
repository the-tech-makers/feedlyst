import type { AgentApproval, AgentPolicy } from "./orchestrator";

export const autonomousAgentPolicy: AgentPolicy = {
  maxAttemptsPerTask: 3,
  approvals: new Set<AgentApproval>([
    "production_deploy",
    "destructive_migration",
    "substantial_delete",
    "billing_or_credentials",
    "ambiguous_requirement",
    "repeated_failure",
  ]),
};

export const autonomousAgentSystemRules = [
  "Work on an isolated branch until explicitly approved for production.",
  "Inspect the existing architecture before making changes.",
  "Prefer the smallest coherent change that advances the stated goal.",
  "Run tests and a build after implementation changes.",
  "Review the diff for correctness, security, regressions, and scope.",
  "Automatically fix ordinary failures and retry up to the configured limit.",
  "Stop for production deployment, destructive migrations, substantial deletion, billing or credentials, ambiguous requirements, or repeated failures.",
  "Never expose secrets in logs, commits, prompts, or generated files.",
  "After a successful preview, verify the deployed behavior before selecting the next task.",
] as const;
