# Design Specification — Dashboard

## Brief
The dashboard is the operational control center for accounts, projects, widgets, connections, usage, and publishing.

## Visual Direction
- Professional SaaS.
- Minimal visual noise.
- High information density without clutter.
- Strong hierarchy and predictable navigation.
- Responsive from mobile to desktop.

## Color Tokens
Primary:
- Brand: `#2563EB`
- Brand hover: `#1D4ED8`
- Brand soft: `#EFF6FF`

Neutral:
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`
- Text primary: `#0F172A`
- Text secondary: `#64748B`
- Text muted: `#94A3B8`

Semantic:
- Success: `#16A34A`
- Warning: `#D97706`
- Error: `#DC2626`
- Info: `#0284C7`

These are initial product tokens, not hard-coded values. They must be centralized in the design system.

## Typography
- UI font: Inter or equivalent system-safe sans-serif.
- Page title: 28–32px.
- Section title: 18–22px.
- Body: 14–16px.
- Caption: 12–13px.

## Layout
- Left navigation on desktop.
- Compact top bar.
- Content max width: 1280px.
- 8px spacing base unit.
- Cards use restrained borders/shadows.
- Primary actions use one dominant visual treatment.

## Required States
Every dashboard page must define loading, empty, error, success, disabled, and permission-denied states.

## Accessibility
WCAG 2.2 AA target. Keyboard navigation and visible focus states are mandatory.
