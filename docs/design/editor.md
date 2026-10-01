# Design Specification — Widget Editor

## Brief
The widget editor is the core product workspace. It must make data source, appearance, behavior, preview, and publication state understandable without technical knowledge.

## Structure
1. Header — widget name, project, save state, preview, publish.
2. Configuration navigation — source/content, layout, style, behavior, advanced.
3. Settings panel — context-specific controls.
4. Preview canvas — responsive preview with desktop/tablet/mobile modes.
5. Publish state — clear distinction between draft and live configuration.

## Editor Principles
- Prefer progressive disclosure over a long settings form.
- Group controls by user intent, not implementation detail.
- Show only settings supported by the selected template.
- Preserve unsaved changes safely through autosave/draft persistence.
- Preview must use the same rendering primitives as production delivery where practical.

## Initial Review Controls
- Source and selected location.
- Review count/order.
- Layout: list, grid, carousel.
- Rating/header visibility.
- Reviewer metadata visibility.
- Typography.
- Colors.
- Card spacing and radius.
- Responsive columns/rows.
- External-link behavior.

## States
- Loading source data.
- No source connected.
- Source unavailable.
- No reviews.
- Partial review data.
- Draft changes.
- Published.
- Publish failure.

## Reference Direction
Elfsight's current editor model separates layout and style controls and exposes layout-specific settings such as columns, rows, spacing, autoplay/navigation, and responsive behavior. Feedlyst should adopt the underlying UX principle while keeping the first editor materially smaller. citeturn0search1turn0search6
