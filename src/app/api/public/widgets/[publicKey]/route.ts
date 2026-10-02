import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function requestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin.toLowerCase();
  const referer = request.headers.get("referer");
  return referer ? new URL(referer).origin.toLowerCase() : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  const { publicKey } = await params;
  const publication = await db.publication.findUnique({
    where: { publicKey },
    select: {
      id: true,
      status: true,
      allowedDomains: true,
      widget: {
        select: {
          id: true,
          type: true,
          name: true,
          sources: { select: { sourceId: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
        },
      },
      activeVersion: { select: { configuration: true, schemaVersion: true, versionNumber: true } },
    },
  });

  if (!publication || publication.status !== "PUBLISHED" || !publication.activeVersion) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  const origin = requestOrigin(request);
  const allowedDomains = Array.isArray(publication.allowedDomains)
    ? publication.allowedDomains.filter((value): value is string => typeof value === "string")
    : [];

  if (origin && allowedDomains.length) {
    const hostname = new URL(origin).hostname.toLowerCase();
    const allowed = allowedDomains.some((domain) => hostname === domain || hostname.endsWith("." + domain));
    if (!allowed) return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  const sourceIds = publication.widget.sources.map((source) => source.sourceId);
  const reviews = sourceIds.length
    ? await db.review.findMany({
        where: { sourceId: { in: sourceIds } },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
          id: true,
          sourceId: true,
          authorName: true,
          authorImageUrl: true,
          rating: true,
          title: true,
          body: true,
          publishedAt: true,
        },
      })
    : [];

  const response = NextResponse.json({
    widget: {
      id: publication.widget.id,
      type: publication.widget.type,
      name: publication.widget.name,
      schemaVersion: publication.activeVersion.schemaVersion,
      versionNumber: publication.activeVersion.versionNumber,
      configuration: publication.activeVersion.configuration,
    },
    reviews,
  });

  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  response.headers.set("Access-Control-Allow-Origin", origin ?? "*");
  response.headers.set("Vary", "Origin");
  return response;
}
