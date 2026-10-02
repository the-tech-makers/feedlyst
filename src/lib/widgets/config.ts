export const REVIEW_WIDGET_SCHEMA_VERSION = 1;

export type ReviewWidgetConfiguration = {
  layout: "list" | "grid" | "carousel";
  theme: "light" | "dark" | "auto";
  showRating: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showAvatar: boolean;
  maxReviews: number;
  minRating: 1 | 2 | 3 | 4 | 5;
};

export const DEFAULT_REVIEW_WIDGET_CONFIGURATION: ReviewWidgetConfiguration = {
  layout: "grid",
  theme: "light",
  showRating: true,
  showAuthor: true,
  showDate: true,
  showAvatar: true,
  maxReviews: 6,
  minRating: 1,
};

export function validateReviewWidgetConfiguration(
  input: unknown,
): ReviewWidgetConfiguration {
  const value = (input ?? {}) as Partial<ReviewWidgetConfiguration>;
  const layout = value.layout ?? DEFAULT_REVIEW_WIDGET_CONFIGURATION.layout;
  const theme = value.theme ?? DEFAULT_REVIEW_WIDGET_CONFIGURATION.theme;
  const maxReviews = value.maxReviews ?? DEFAULT_REVIEW_WIDGET_CONFIGURATION.maxReviews;
  const minRating = value.minRating ?? DEFAULT_REVIEW_WIDGET_CONFIGURATION.minRating;

  if (!["list", "grid", "carousel"].includes(layout)) throw new Error("INVALID_WIDGET_LAYOUT");
  if (!["light", "dark", "auto"].includes(theme)) throw new Error("INVALID_WIDGET_THEME");
  if (!Number.isInteger(maxReviews) || maxReviews < 1 || maxReviews > 50) {
    throw new Error("INVALID_WIDGET_MAX_REVIEWS");
  }
  if (![1, 2, 3, 4, 5].includes(minRating)) throw new Error("INVALID_WIDGET_MIN_RATING");

  return {
    layout,
    theme,
    showRating: value.showRating ?? true,
    showAuthor: value.showAuthor ?? true,
    showDate: value.showDate ?? true,
    showAvatar: value.showAvatar ?? true,
    maxReviews,
    minRating,
  };
}
