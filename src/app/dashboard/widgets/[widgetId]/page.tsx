import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import WidgetEditor from "./widget-editor";

export default async function WidgetEditorPage({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { widgetId } = await params;
  const widget = await db.widget.findFirst({
    where: {
      id: widgetId,
      type: "review",
      project: { account: { memberships: { some: { userId: session.user.id } } } },
    },
    include: {
      project: { select: { id: true, name: true } },
      sources: {
        orderBy: { sortOrder: "asc" },
        select: { sourceId: true, source: { select: { id: true, name: true, externalId: true } } },
      },
      versions: { where: { state: "DRAFT" }, take: 1 },
      publication: { select: { publicKey: true, status: true, allowedDomains: true } },
    },
  });

  if (!widget) notFound();

  const draft = widget.versions[0];
  if (!draft) notFound();

  const sources = await db.source.findMany({
    where: { connection: { accountId: widget.accountId }, status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, externalId: true },
  });

  const previewSourceIds = widget.sources.map((item) => item.sourceId);
  const previewReviews = previewSourceIds.length
    ? await db.review.findMany({
        where: { sourceId: { in: previewSourceIds } },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
          id: true,
          authorName: true,
          authorImageUrl: true,
          rating: true,
          title: true,
          body: true,
          publishedAt: true,
        },
      })
    : [];

  return (
    <WidgetEditor
      widget={{
        id: widget.id,
        name: widget.name,
        projectName: widget.project.name,
        sourceIds: previewSourceIds,
        configuration: draft.configuration,
        publication: widget.publication,
      }}
      sources={sources}
      previewReviews={previewReviews}
    />
  );
}
