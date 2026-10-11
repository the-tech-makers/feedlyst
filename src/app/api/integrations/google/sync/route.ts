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
    const status = message === "UNAUTHENTICATED" ? 401 : 502;
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Unable to sync this connection. Check the Google connection and try again." }, { status });
  }
}
