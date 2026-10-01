# Design Specification — Design System

## Brief
Defines the shared visual language for the Feedlyst dashboard and widget editor. Page-specific documents may extend this system but should not redefine core tokens.

## Brand Tokens
| Token | Value | Usage |
|---|---|---|
| brand-600 | #2563EB | Primary actions, links |
| brand-700 | #1D4ED8 | Hover/active |
| brand-50 | #EFF6FF | Soft brand surfaces |
| slate-950 | #0F172A | Primary text |
| slate-500 | #64748B | Secondary text |
| slate-400 | #94A3B8 | Muted text |
| slate-200 | #E2E8F0 | Borders |
| slate-50 | #F8FAFC | App background |
| white | #FFFFFF | Surfaces |
| success | #16A34A | Success |
| warning | #D97706 | Warning |
| error | #DC2626 | Error |
| info | #0284C7 | Informational |

## Typography
- Primary font: Inter or equivalent system sans-serif.
- Page title: 28–32px / 700.
- Section title: 18–22px / 600–700.
- Body: 14–16px / 400–500.
- Caption: 12–13px / 400–500.

## Spacing & Shape
- Base spacing unit: 4px; common layout rhythm: 8px.
- Control height: 36–40px.
- Radius: 8px controls, 12px cards, 16px prominent surfaces.
- Shadows are subtle and used primarily for elevation, not decoration.

## Interaction
- Primary action must be visually distinct from secondary actions.
- Destructive actions require confirmation when data loss is possible.
- Save/publish state must always be visible in editors.
- Loading, empty, error, disabled, and success states are designed—not improvised.

## Accessibility
- Target WCAG 2.2 AA.
- Keyboard navigation is required.
- Focus indicators must remain visible.
- Color must not be the only status indicator.
- Interactive controls need accessible names.

## Design Governance
Design tokens belong in one shared source. Do not hard-code page-specific copies of token values.
