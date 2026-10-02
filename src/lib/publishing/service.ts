import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";

export async function publishWidget(widgetId: string, userId: string) {
  const widget = await db.widget.findFirst({
    where: {
      id: widgetId,
      project: { account: { memberships: { some: { userId } } } },
    },
    select: { id: true, accountId: true },
  });
  if (!widget) throw new Error("WIDGET_NOT_FOUND");

  const version = await db.widgetVersion.findUnique({
    where: { widgetId_state: { widgetId, state: "PUBLISHED" } },
    select: { id: true },
  });
  if (!version) throw new Error("WIDGET_NOT_PUBLISHED");

  const existing = await db.publication.findUnique({
    where: { widgetId },
    select: { id: true, publicKey: true },
  });

  return db.publication.upsert({
    where: { widgetId },
    create: {
      widgetId,
      publicKey: randomBytes(24).toString("base64url"),
      status: "PUBLISHED",
      activeVersionId: version.id,
    },
    update: {
      status: "PUBLISHED",
      activeVersionId: version.id,
    },
  });
}

export async function setAllowedDomains(widgetId: string, userId: string, domains: readonly string[]) {
  const widget = await db.widget.findFirst({
    where: {
      id: widgetId,
      project: { account: { memberships: { some: { userId } } } },
    },
    select: { id: true },
  });
  if (!widget) throw new Error("WIDGET_NOT_FOUND");

  const normalized = [...new Set(domains.map((domain) => domain.trim().toLowerCase()).filter(Boolean))];
  return db.publication.update({
    where: { widgetId },
    data: { allowedDomains: normalized },
  });
}
