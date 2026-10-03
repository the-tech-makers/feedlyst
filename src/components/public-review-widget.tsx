import { getReviewViewModels, type ReviewData } from "@/lib/widgets/renderer";
import { DEFAULT_REVIEW_WIDGET_CONFIGURATION, validateReviewWidgetConfiguration, type ReviewWidgetConfiguration } from "@/lib/widgets/config";

export default function PublicReviewWidget({ configuration, reviews, name }: { configuration: unknown; reviews: ReviewData[]; name: string }) {
  let config: ReviewWidgetConfiguration;
  try { config = validateReviewWidgetConfiguration(configuration); } catch { config = DEFAULT_REVIEW_WIDGET_CONFIGURATION; }
  const visibleReviews = getReviewViewModels(reviews, config);
  const themeClass = config.theme === "dark" ? "bg-slate-950 text-white" : config.theme === "auto" ? "bg-white text-slate-950 dark:bg-slate-950 dark:text-white" : "bg-white text-slate-950";
  const rated = visibleReviews.filter((review) => review.rating != null);
  const average = rated.length ? rated.reduce((sum, review) => sum + (review.rating ?? 0), 0) / rated.length : 0;

  return <main className={`min-h-screen w-full p-4 ${themeClass}`}>
    <section aria-label={name} className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">{name}</h1>
        {config.showRating && rated.length > 0 && <span className="rounded-full bg-black/5 px-3 py-1 text-sm dark:bg-white/10">★ {average.toFixed(1)}</span>}
      </div>
      {visibleReviews.length === 0 ? <div role="status" className="rounded-xl border border-dashed p-8 text-center text-sm opacity-70">No reviews are available.</div> :
        <div className={config.layout === "list" ? "space-y-3" : config.layout === "carousel" ? "flex gap-4 overflow-x-auto pb-2" : "grid gap-4 sm:grid-cols-2"}>
          {visibleReviews.map((review) => <article key={review.id} className={`rounded-xl border border-current/10 p-5 ${config.layout === "carousel" ? "min-w-[280px]" : ""}`}>
            {config.showAvatar && (review.authorImageUrl ? <img src={review.authorImageUrl} alt="" className="mb-3 h-9 w-9 rounded-full object-cover" /> : <div aria-hidden="true" className="mb-3 h-9 w-9 rounded-full bg-current/10" />)}
            {config.showRating && review.rating != null && <div aria-label={`${review.rating} out of 5 stars`} className="text-sm">{"★".repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}</div>}
            {review.title && <h2 className="mt-2 font-medium">{review.title}</h2>}
            {review.body && <p className="mt-2 text-sm opacity-80">{review.body}</p>}
            {config.showAuthor && review.authorName && <p className="mt-3 text-xs font-medium">{review.authorName}</p>}
            {config.showDate && review.formattedDate && <time className="mt-1 block text-xs opacity-50" dateTime={review.publishedAt ? new Date(review.publishedAt).toISOString() : undefined}>{review.formattedDate}</time>}
          </article>)}
        </div>}
    </section>
  </main>;
}