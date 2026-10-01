# Feedlyst Documentation

## Purpose
This directory is the product and engineering source of truth for Feedlyst.

## Documentation Areas
- `scope/` — product scope, phases, modules, and functional requirements.
- `architecture/` — system architecture and technical decisions.
- `design/` — UI/UX, visual system, accessibility, and page specifications.
- `tasks/` — implementation work items and task status.
- `tests/` — functional, integration, security, performance, and release tests.
- `process/` — engineering rules, conventions, quality gates, and release process.

## Product Direction
Feedlyst is a multi-tenant SaaS platform for connecting external content/data sources to configurable website widgets and publishing those widgets through embeddable delivery.

The platform must separate:
1. **Source** — where data comes from.
2. **Connection** — authorization and credentials used to access a source.
3. **Widget** — how normalized data is presented.
4. **Project** — the website/client context in which widgets are organized.
5. **Publication** — how a widget is delivered to an external website.

## Documentation Rule
Scope documents define what is required. Task documents define how work is executed. Design documents define user-facing behavior and visual standards. Tests define acceptance evidence.

All documents must remain concise, version-controlled, and independently reviewable.
