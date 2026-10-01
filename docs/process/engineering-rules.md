# Engineering Rules

## Purpose
Define non-negotiable development standards for Feedlyst.

## Repository Rules
- Keep documentation and code in Git; GitHub is the source of truth.
- Every feature must map to a scope module and implementation task.
- Do not implement undocumented product behavior without updating scope first.
- Prefer small, composable modules over large feature files.

## File Size
- Target source files: **under 200–300 lines**.
- Documentation files: target **under 200–300 lines**.
- If a file approaches the limit, split it by responsibility.
- Avoid artificial splitting when it harms cohesion; use a clear parent/index document.

## Architecture
- Separate provider-specific adapters from domain models.
- Never expose provider credentials to the browser.
- External APIs must not be called directly for every widget visitor unless explicitly designed and rate-limited.
- Prefer asynchronous synchronization, normalized storage, caching, and CDN delivery.
- APIs must validate authorization at the tenant/project/widget boundary.
- Configuration schemas must be versioned when persisted.

## Security
- Store secrets encrypted at rest.
- Apply least-privilege access.
- Validate OAuth state and redirect URIs.
- Enforce tenant isolation on every data access path.
- Never log access tokens, refresh tokens, API keys, or sensitive provider payloads.

## Frontend
- Use accessible semantic HTML.
- Design mobile-first.
- Reuse design tokens and shared components.
- Avoid page-specific visual values when a design token exists.
- Loading, empty, error, and permission-denied states are mandatory.

## Backend
- Use typed contracts.
- Idempotent synchronization jobs are preferred.
- External provider failures must degrade gracefully.
- Add observability around sync, publishing, API errors, and widget delivery.

## Git
- Use small commits with clear intent.
- One logical change per commit where practical.
- Pull requests must include tests and documentation updates when behavior changes.
