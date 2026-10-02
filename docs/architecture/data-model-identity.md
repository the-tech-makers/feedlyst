# Data Model — Identity & Tenancy

## Brief
Defines customer tenancy and authentication persistence without coupling product tenancy to a specific authentication provider.

## User
Represents a human who can authenticate.

Fields:
- id
- email
- name
- image/avatar URL (optional)
- email verification state
- createdAt
- updatedAt

## Account
Represents a Feedlyst customer/tenant.

Fields:
- id
- name
- slug
- status
- createdAt
- updatedAt

A user may eventually belong to multiple Accounts.

## Membership
Connects User to Account.

Fields:
- id
- accountId
- userId
- role
- createdAt
- updatedAt

Constraint: accountId + userId must be unique.

MVP roles: OWNER and MEMBER.

## Auth Account
Represents an external authentication identity linked to a User. It is not a Feedlyst customer Account.

Fields:
- id
- userId
- provider
- providerAccountId
- credential/token material where required
- token expiry metadata where applicable

Constraint: provider + providerAccountId must be unique.

Sensitive authentication material must be protected according to Auth.js security guidance.

## Session
If database-backed sessions are selected, persist:
- id
- userId
- sessionToken
- expiresAt

sessionToken must be unique.

## Tenant Rules
Project, Connection, Widget, Publication, Usage and Billing records must resolve to an Account.

Account deletion is a controlled lifecycle operation. It must not be an accidental cascade from an ordinary user operation.


## MVP Authentication Strategy
Feedlyst uses Auth.js with JWT sessions for the MVP. The custom Feedlyst authentication tables are not used as an Auth.js database-session adapter.

Credential passwords are stored only as salted bcrypt hashes in User.passwordHash. Password hashes are never returned to clients or logged. JWTs carry the authenticated Feedlyst User ID; every protected application service resolves tenant access through Membership records.

Email verification, password reset, rate limiting and MFA are follow-up security work and must be completed before the authentication milestone is marked DONE.
