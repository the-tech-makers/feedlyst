import { describe, expect, it } from "vitest";
import { DEFAULT_REVIEW_WIDGET_CONFIGURATION } from "@/lib/widgets/config";
import { filterReviews, formatReviewDate, getReviewViewModels } from "./renderer";

const reviews = [
  {
    id: "1",
    authorName: "Asha",
    authorImageUrl: null,
    rating: 5,
    title: "Excellent",
    body: "Fast and professional.",
    publishedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "2",
    authorName: null,
    authorImageUrl: null,
    rating: 3,
    title: null,
    body: null,
    publishedAt: null,
  },
  {
    id: "3",
    authorName: "Rahul",
    authorImageUrl: null,
    rating: null,
    title: null,
    body: "No rating supplied.",
    publishedAt: "not-a-date",
  },
];

describe("review renderer helpers", () => {
  it("filters by minimum rating and max reviews", () => {
    expect(
      filterReviews(reviews, {
        ...DEFAULT_REVIEW_WIDGET_CONFIGURATION,
        minRating: 4,
        maxReviews: 1,
      }),
    ).toEqual([reviews[0]]);
  });

  it("keeps unrated reviews and tolerates missing optional fields", () => {
    const viewModels = getReviewViewModels(reviews, {
      ...DEFAULT_REVIEW_WIDGET_CONFIGURATION,
      minRating: 5,
      maxReviews: 10,
    });

    expect(viewModels).toHaveLength(2);
    expect(viewModels[1].formattedDate).toBe("");
    expect(viewModels[1].authorName).toBe("Rahul");
    expect(viewModels[1].body).toBe("No rating supplied.");
  });

  it("formats valid dates and safely handles invalid values", () => {
    expect(formatReviewDate("2026-09-01T00:00:00.000Z")).toBe("Sep 1, 2026");
    expect(formatReviewDate("not-a-date")).toBe("");
    expect(formatReviewDate(null)).toBe("");
  });

  it("returns an empty result for empty data", () => {
    expect(getReviewViewModels([], DEFAULT_REVIEW_WIDGET_CONFIGURATION)).toEqual([]);
  });
});
