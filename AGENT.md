# Feedlyst Autonomous Agent

The autonomous agent works toward a project goal by repeatedly planning one bounded task, inspecting the repository, making changes, running verification, reviewing the diff, fixing ordinary failures, and verifying a preview deployment.

## Operating loop

1. Inspect the repository and current project state.
2. Select exactly one next task that advances the project goal.
3. Implement the smallest coherent change.
4. Run lint, typecheck, build, and relevant tests.
5. Review the diff for correctness, security, regressions, and scope.
6. Fix ordinary failures and retry up to three attempts.
7. Create or inspect a Vercel preview.
8. Verify the preview behavior.
9. Record the result and select the next task.

## Human approval gates

The agent must stop before:

- production deployment
- destructive database migrations
- substantial deletion or replacement of existing functionality
- billing changes or credential operations
- ambiguous requirements that materially change product behavior
- repeated failures after the configured retry limit

## Configuration

The planning/review model uses an OpenAI-compatible chat-completions endpoint:

- AGENT_MODEL_BASE_URL
- AGENT_MODEL_API_KEY
- AGENT_MODEL_NAME
- AGENT_RUN_TOKEN

Secrets must only be supplied through environment variables. Never commit them.

## Current implementation

- src/lib/agent/orchestrator.ts — execution state machine and safety gates.
- src/lib/agent/policy.ts — default safety policy.
- src/lib/agent/model.ts — provider-agnostic planning/review adapter.
- src/app/api/agent/plan/route.ts — protected planning endpoint.

The repository/Vercel tool adapters are intentionally separated from the orchestration core so the agent can later run with GitHub App/OAuth credentials or another controlled execution environment without changing planning logic.