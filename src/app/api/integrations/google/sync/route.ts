import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncGoogleConnection } from "@/lib/integrations/google-sync";
import { GOOGLE_INTEGRATION_KEY } from "@/lib/integrations/google";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = (await request.json().catch(() => ({}))) as { connectionId?: string };
    if (!input.connectionId) return NextResponse.json({ error: "connectionId is required" }, { status: 400 });

    const connection = await db.connection.findFirst({
      where: {
        id: input.connectionId,
        status: "ACTIVE",
        integration: { key: GOOGLE_INTEGRATION_KEY, status: "ACTIVE" },
        account: { memberships: { some: { userId: user.id } } },
      },
      select: { id: true },
    });
    if (!connection) return NextResponse.json({ error: "Connection not found or unavailable" }, { status: 404 });

    const result = await syncGoogleConnection(connection.id);
    const reviews = result.results.reduce((sum, item) => sum + item.created + item.updated, 0);
    return NextResponse.json({ sources: result.sources, reviews });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Google Business Profile sync failed", message || "UNKNOWN_SYNC_ERROR");
    const match = message.match(/^GOOGLE_API_(\d{3})(?::(.*))?$/);
    const code = match ? Number(match[1]) : 0;
    const detail = match?.[2]?.trim();
    let errorMessage = "Unable to sync this connection. Check the Google connection and try again.";
    if (code === 401) errorMessage = "Google rejected the access token. Reconnect Google Business Profile and try again.";
    if (code === 403) errorMessage = "Google denied API access (403). Check Business Profile API access approval, enabled APIs, and access to the business location.";
    if (code === 404) errorMessage = `Google Business Profile returned 404${detail ? `: ${detail}` : "."} Verify the location resource and that your Google Cloud project has access to the required Business Profile APIs.`;
    if (code === 429) errorMessage = "Google Business Profile API quota was exceeded (429). Check API access and quota in Google Cloud Console, then retry later.";
    if (code && ![401, 403, 404, 429].includes(code)) errorMessage = `Google Business Profile API request failed (HTTP ${code})${detail ? `: ${detail}` : "."}`;
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }
}
