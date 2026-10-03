import { notFound } from "next/navigation";
import PublicReviewWidget from "@/components/public-review-widget";
import { db } from "@/lib/db";
import { recordWidgetLoad } from "@/lib/usage/service";

export default async function PublicWidgetPage({ params }: { params: Promise<{ publicKey: string }> }) {
  const { publicKey } = await params;
  const publication = await db.publication.findUnique({
    where: { publicKey },
    select: { status: true, widget: { select: { name: true, sources: { select: { sourceId: true } } } }, activeVersion: { select: { configuration: true } } },
  });
  if (!publication || publication.status !== "PUBLISHED" || !publication.activeVersion) notFound();
  await recordWidgetLoad(publication.id);
  const sourceIds = publication.widget.sources.map((source) => source.sourceId);
  const reviews = sourceIds.length ? await db.review.findMany({
    where: { sourceId: { in: sourceIds } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: { id: true, authorName: true, authorImageUrl: true, rating: true, title: true, body: true, publishedAt: true },
  }) : [];
  return <PublicReviewWidget configuration={publication.activeVersion.configuration} reviews={reviews} name={publication.widget.name} />;
}