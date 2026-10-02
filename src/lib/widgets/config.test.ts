import { describe, expect, it } from "vitest";
import {
  DEFAULT_REVIEW_WIDGET_CONFIGURATION,
  validateReviewWidgetConfiguration,
} from "@/lib/widgets/config";

describe("review widget configuration", () => {
  it("returns defaults for an empty configuration", () => {
    expect(validateReviewWidgetConfiguration({})).toEqual(
      DEFAULT_REVIEW_WIDGET_CONFIGURATION,
    );
  });

  it("preserves supported configuration values", () => {
    expect(validateReviewWidgetConfiguration({
      layout: "carousel",
      theme: "dark",
      showRating: false,
      showAuthor: true,
      showDate: false,
      showAvatar: false,
      maxReviews: 12,
      minRating: 4,
    })).toEqual({
      layout: "carousel",
      theme: "dark",
      showRating: false,
      showAuthor: true,
      showDate: false,
      showAvatar: false,
      maxReviews: 12,
      minRating: 4,
    });
  });

  it("rejects unsupported layout and theme", () => {
    expect(() => validateReviewWidgetConfiguration({ layout: "masonry" }))
      .toThrow("INVALID_WIDGET_LAYOUT");
    expect(() => validateReviewWidgetConfiguration({ theme: "brand" }))
      .toThrow("INVALID_WIDGET_THEME");
  });

  it("rejects unsafe review limits and ratings", () => {
    expect(() => validateReviewWidgetConfiguration({ maxReviews: 0 }))
      .toThrow("INVALID_WIDGET_MAX_REVIEWS");
    expect(() => validateReviewWidgetConfiguration({ maxReviews: 51 }))
      .toThrow("INVALID_WIDGET_MAX_REVIEWS");
    expect(() => validateReviewWidgetConfiguration({ minRating: 6 }))
      .toThrow("INVALID_WIDGET_MIN_RATING");
  });
});
