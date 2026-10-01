# Task Management

## Brief
Task files are the implementation contract derived from scope documents.

## Statuses
- **PLANNED** — defined but not started.
- **READY** — dependencies satisfied and ready for implementation.
- **IN PROGRESS** — actively being implemented.
- **BLOCKED** — blocked by dependency or decision.
- **REVIEW** — implementation complete and awaiting review/tests.
- **DONE** — accepted and verified.
- **DEFERRED** — intentionally moved to a later phase.

## Naming
Use:
`docs/tasks/<module>/<task-name>.md`

## Required Task Sections
- Objective.
- Scope.
- Dependencies.
- Acceptance criteria.
- Implementation notes.
- Tests.
- Status.
- Completion date.

## Rule
A task must be small enough to implement and review independently. If a task becomes a mini-project, split it.
