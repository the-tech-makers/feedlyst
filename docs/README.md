# Feedlyst Documentation

## Purpose
This directory is the product and engineering source of truth for Feedlyst.

## Structure
- `scope/` — product scope, phases, modules, and non-functional requirements.
- `architecture/` — system architecture, data model, and architecture decisions.
- `design/` — design system, dashboard, pages, and widget editor specifications.
- `tasks/` — implementation contracts plus the operational status board.
- `tests/` — test strategy, phase plans, and release matrix.
- `security/` — cross-cutting security baseline and release controls.
- `reference/` — competitive/product reference research; not direct implementation requirements.
- `process/` — engineering rules, conventions, quality gates, and release process.
- `milestones.md` — milestone-level roadmap and exit criteria.

## Product Direction
Feedlyst is a multi-tenant SaaS platform for connecting external data sources to configurable website widgets and publishing those widgets through embeddable delivery.

The platform separates:
1. **Source** — where data comes from.
2. **Connection** — authorization and credentials used to access a source.
3. **Widget** — how normalized data is presented.
4. **Project** — website/client context in which widgets are organized.
5. **Publication** — how a widget is delivered externally.

## Documentation Flow
Scope → Architecture/Design → Task → Implementation → Test → Review → Status Board.

Scope answers **what** is required. Architecture answers **where responsibilities live**. Design answers **how the user interacts with it**. Tasks answer **what is being implemented now**. Tests provide acceptance evidence.

## Governance
- Keep documents independently reviewable.
- Keep source and documentation files under roughly 200–300 lines unless a strong reason exists.
- Do not implement undocumented product behavior without updating the appropriate scope/task documentation.
- Competitive references inform decisions but do not automatically become requirements.
