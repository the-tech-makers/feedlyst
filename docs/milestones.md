# Feedlyst — Milestones

## Brief
Milestones convert the approved product scope into implementation checkpoints. A milestone is complete only when its scope, code, tests, documentation, and acceptance criteria are complete.

## M0 — Product & Engineering Baseline
Status: IN PROGRESS

Modules:
- Documentation structure
- Engineering rules
- Architecture baseline
- Design system baseline
- Test strategy

Exit criteria:
- Scope is approved.
- Core entities and boundaries are documented.
- Development and review rules are agreed.

## M1 — Secure Platform Foundation
Status: PLANNED

Modules:
- Authentication
- Tenant/account model
- Projects
- Application shell
- Authorization

Exit criteria:
- User can authenticate and manage isolated projects.
- Automated authorization tests pass.

## M2 — Google Reviews Integration
Status: PLANNED

Modules:
- Integration registry
- Connection lifecycle
- Source discovery
- Review synchronization
- Review normalization

Exit criteria:
- A real supported Google source can be connected and synchronized safely.

## M3 — Review Widget Engine
Status: PLANNED

Modules:
- Widget lifecycle
- Configuration schema
- Templates
- Editor/preview
- Runtime renderer

Exit criteria:
- Multiple widgets can use one source with independent configurations.

## M4 — Publishing & Embed Delivery
Status: PLANNED

Modules:
- Publication/versioning
- Embed runtime
- Share URL
- Installation guides
- Domain controls
- CDN/cache delivery

Exit criteria:
- A published widget works on an external website without dashboard authentication.

## M5 — Usage & Billing
Status: PLANNED

Modules:
- Usage metering
- Plans
- Billing provider
- Limits
- Customer billing portal

Exit criteria:
- Usage and subscription state are consistent across dashboard and public delivery.

## M6 — Growth & Agency Platform
Status: DEFERRED

Modules:
- Additional integrations
- Templates/catalog
- Collaboration
- Analytics
- Agency features
- Enterprise controls

Exit criteria:
- New integrations and commercial capabilities can be added without changing the core platform boundaries.

## Milestone Rules
- No milestone is closed with known critical defects.
- Each milestone has a test plan.
- Scope changes are documented before implementation.
- Dependencies and deferred work are explicitly recorded.
