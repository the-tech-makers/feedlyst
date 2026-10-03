import type { ReviewWidgetConfiguration } from "@/lib/widgets/config";

export type ReviewData = {
  id: string;
  authorName: string | null;
  authorImageUrl: string | null;
  rating: number | null;
  title: string | null;
  body: string | null;
  publishedAt: string | Date | null;
};

export type ReviewViewModel = ReviewData & {
  formattedDate: string;
};

export function filterReviews(
  reviews: ReviewData[],
  config: ReviewWidgetConfiguration,
): ReviewData[] {
  return reviews
    .filter((review) => review.rating == null || review.rating >= config.minRating)
    .slice(0, config.maxReviews);
}

export function formatReviewDate(value: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function getReviewViewModels(
  reviews: ReviewData[],
  config: ReviewWidgetConfiguration,
): ReviewViewModel[] {
  return filterReviews(reviews, config).map((review) => ({
    ...review,
    formattedDate: formatReviewDate(review.publishedAt),
  }));
}
