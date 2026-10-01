# Test Plan — Phase 1 Foundation

## Brief
Validate authentication, tenant isolation, projects, and application shell.

## Cases
- Register with valid data.
- Reject invalid registration.
- Verify email.
- Login/logout.
- Reject invalid credentials.
- Expire and renew sessions.
- Reset password.
- Create project.
- Rename project.
- Archive project.
- Reject malformed project data.
- Attempt cross-tenant project access.
- Attempt cross-tenant API mutation.
- Verify project ownership after account changes.

## Security
- CSRF/state protections where applicable.
- Secure cookie flags.
- Password hashing.
- No secrets in logs.
- Authorization checked server-side.

## Acceptance
All critical cases automated; no cross-tenant access path remains.
