# Task — Embed Runtime

## Brief
Implementation contract for the Embed Runtime module in M4.

## Status
REVIEW

## Objective
Deliver published widgets to anonymous external visitors.

## Scope
Async loader, public widget endpoint, safe configuration retrieval, runtime rendering, cache headers, graceful failure.

## Dependencies
Published widget model and CDN/cache infrastructure.

## Acceptance Criteria
- Public runtime never requires dashboard authentication or provider credentials.

## Tests
- External-origin E2E; timeout; malformed config; unpublished ID; performance.

## Completion
Implementation complete; verification remains.
