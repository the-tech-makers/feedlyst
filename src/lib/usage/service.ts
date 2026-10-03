import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export async function recordWidgetLoad(publicationId: string, occurredAt = new Date()) {
  const publication = await db.publication.findUnique({
    where: { id: publicationId },
    select: { id: true, widgetId: true, widget: { select: { accountId: true, projectId: true } } },
  });
  if (!publication) return false;

  const bucket = Math.floor(occurredAt.getTime() / 60_000);
  const eventKey = createHash("sha256")
    .update(`widget-load:${publication.id}:${bucket}`)
    .digest("hex");

  await db.usageEvent.upsert({
    where: { eventKey },
    create: {
      eventKey,
      accountId: publication.widget.accountId,
      projectId: publication.widget.projectId,
      widgetId: publication.widgetId,
      publicationId: publication.id,
      eventType: "WIDGET_LOAD",
      quantity: 1,
      occurredAt,
    },
    update: {},
  });
  return true;
}

export async function getCurrentMonthUsage(accountId: string, now = new Date()) {
  const start = monthStart(now);
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const result = await db.usageEvent.aggregate({
    where: { accountId, eventType: "WIDGET_LOAD", occurredAt: { gte: start, lt: end } },
    _sum: { quantity: true },
  });
  return { periodStart: start, periodEnd: end, widgetLoads: result._sum.quantity ?? 0 };
}
