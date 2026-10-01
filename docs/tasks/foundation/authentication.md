# Task — Authentication

## Brief
Implementation contract for the Authentication module in M1.

## Status
IN PROGRESS

## Objective
Implement secure account authentication and session lifecycle.

## Scope
Sign-up, credential login/logout, JWT session lifecycle, server-side authorization hooks. Email verification and password reset remain follow-up work.

## Dependencies
No application-specific dependencies.

## Acceptance Criteria
- User can register with a password that is stored only as a salted hash.
- User can authenticate through Auth.js credentials and receive a server-managed session.
- Protected server routes reject unauthenticated requests.
- Tenant/project access is checked through membership before data access.
- Email verification, password reset, and abuse/rate-limit hardening are explicitly tracked as remaining work.

## Tests
- Registration validation and duplicate-email handling.
- Password hash verification through the authentication flow.
- Unauthenticated project access returns 401.
- Non-member project access returns 404/403 without leaking tenant data.
- Session expiry and password reset tests remain pending.

## Completion
Pending.
