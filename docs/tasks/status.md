# Task Status Board

## Brief
Single operational view of implementation work. Detailed execution remains in individual task files.

## Status Definitions
- PLANNED — defined, dependencies may not be ready.
- READY — dependencies satisfied; implementation can start.
- IN PROGRESS — actively being implemented.
- BLOCKED — waiting on dependency or decision.
- REVIEW — implementation complete; awaiting review or verification.
- DONE — accepted, tested, and merged.
- DEFERRED — intentionally moved to a later milestone.

## M0 — Product & Engineering Baseline
| Module | Task | Status |
|---|---|---|
| Documentation | Documentation foundation | DONE |
| Architecture | System boundaries | DONE |
| Architecture | Core data model | DONE |
| Architecture | Provider-neutral core ADR | DONE |
| Design | Dashboard/page baseline | DONE |
| Design | Shared design system | DONE |
| Design | Widget editor specification | DONE |
| Testing | Test strategy | DONE |
| Testing | Test matrix | DONE |
| Reference | Elfsight feature map | DONE |

## M1 — Platform Foundation
| Module | Task | Status |
|---|---|---|
| Foundation | Platform foundation | IN PROGRESS |
| Authentication | Authentication | IN PROGRESS |
| Projects | Projects | IN PROGRESS |

## M2 — Integration Engine
| Module | Task | Status |
|---|---|---|
| Registry | Integration registry | DONE |
| Connections | Connection lifecycle | IN PROGRESS |
| Synchronization | Background synchronization | IN PROGRESS |
| Google Reviews | Provider integration | IN PROGRESS |

## M3 — Widget Engine
| Module | Task | Status |
|---|---|---|
| Widget Core | Widget lifecycle/configuration | IN PROGRESS |
| Editor | Review widget editor | IN PROGRESS |
| Review Widget | Review widget MVP | IN PROGRESS |

## M4 — Publishing & Delivery
| Module | Task | Status |
|---|---|---|
| Embed Runtime | Public widget runtime | REVIEW |
| Installation | Embed/share installation | REVIEW |

## M5 — Usage & Billing
| Module | Task | Status |
|---|---|---|
| Usage | Usage metering | IN PROGRESS |
| Billing | Subscriptions | PLANNED |

## M6 — Growth
| Module | Task | Status |
|---|---|---|
| Integrations | Additional providers | DEFERRED |
| Collaboration | Team/project members | DEFERRED |
| Analytics | Advanced analytics | DEFERRED |
| Agency | Client/white-label workflows | DEFERRED |
| Enterprise | SSO/SCIM/audit controls | DEFERRED |

## Operating Rules
- Update this board whenever task status changes.
- A task cannot be DONE without acceptance criteria and tests completed.
- BLOCKED tasks must document the blocker.
- Completed task files remain as historical implementation evidence.
