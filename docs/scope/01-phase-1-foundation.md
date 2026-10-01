# Scope 01 — Phase 1: Platform Foundation

## Brief
Establish the secure multi-tenant foundation required by every later feature.

## Module 1.1 — Authentication
- Email/password authentication.
- Email verification.
- Password reset.
- Session management.
- Basic account profile.
- Optional social login architecture.

## Module 1.2 — Tenant Model
- User/account ownership.
- Tenant isolation.
- Roles prepared for future collaborators.
- Audit fields on mutable records.

## Module 1.3 — Projects
- Create, rename, archive, and delete project.
- Project name, website URL, timezone, status.
- Project-level widget listing.
- Project-level settings.

## Module 1.4 — Application Shell
- Dashboard navigation.
- Responsive layout.
- Global notifications.
- Loading/error/empty states.
- Permission-aware UI.

## Acceptance
A new user can authenticate, create a project, reopen it, and see an empty widget workspace without accessing another tenant's data.
