# Task — Platform Foundation

## Status
IN PROGRESS

## Objective
Establish the base application, authentication, tenant model, project model, environment configuration, and development conventions.

## Scope
- Application shell.
- Database foundation.
- Authentication.
- Account/tenant ownership.
- Projects CRUD.
- Authorization middleware.
- Error handling.
- Basic audit timestamps.

## Dependencies
None.

## Acceptance Criteria
- User can register/login/logout.
- User can create/update/archive a project.
- Every project belongs to exactly one tenant.
- Unauthorized users cannot access another tenant's project.
- Automated tests cover authorization boundaries.

## Tests
- Authentication flow.
- Session expiry.
- Tenant isolation.
- Project CRUD.
- Validation and error states.

## Implementation Notes
- Next.js App Router source code lives under `src/`.
- Prisma 7 with PostgreSQL is the initial data layer.
- The Prisma schema is derived directly from `docs/architecture/data-model-schema.md`.
- Prisma Client uses the PostgreSQL `pg` driver adapter.
- Tailwind CSS 4 is configured through PostCSS.
- Runtime database access is centralized in `src/lib/db.ts`.
- Authentication and tenant/project services remain part of this task and are not yet complete.

## Completion
Pending.
