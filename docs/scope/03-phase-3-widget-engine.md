# Scope 03 — Phase 3: Widget Engine

## Brief
Provide a reusable rendering/configuration system where data source and presentation are independent.

## Module 3.1 — Widget Lifecycle
- Create draft.
- Configure.
- Preview.
- Publish.
- Unpublish.
- Duplicate.
- Archive.
- Restore.

## Module 3.2 — Widget Configuration
Configuration includes:
- layout;
- content limits;
- typography;
- colors;
- spacing;
- borders/radius;
- responsive behavior;
- visibility rules;
- provider attribution where required.

## Module 3.3 — Templates
Initial review templates:
- Card list.
- Carousel.
- Grid.
- Compact rating summary.

Templates must use normalized data and a versioned configuration schema.

## Module 3.4 — Preview
- Live configuration preview.
- Desktop/tablet/mobile modes.
- Representative loading/empty/error states.
- Preview must not expose secrets.

## Module 3.5 — Rendering
- Shared widget runtime.
- Lazy loading.
- Minimal payloads.
- Defensive rendering for incomplete provider data.
- Accessibility support.

## Acceptance
A user can create multiple widgets from the same source with different layouts and settings without duplicating the underlying connection.
