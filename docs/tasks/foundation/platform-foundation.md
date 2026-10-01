# Task — Platform Foundation

## Status
READY

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

## Completion
Pending.
