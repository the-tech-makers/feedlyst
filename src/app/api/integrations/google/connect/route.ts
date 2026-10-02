import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOAuthState } from "@/lib/integrations/oauth-state";
import { buildGoogleAuthorizationUrl, GOOGLE_INTEGRATION_KEY } from "@/lib/integrations/google";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const account = await db.account.findFirst({
      where: { memberships: { some: { userId: user.id } }, status: "ACTIVE" },
      select: { id: true },
    });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const integration = await db.integration.upsert({
      where: { key: GOOGLE_INTEGRATION_KEY },
      create: {
        key: GOOGLE_INTEGRATION_KEY,
        name: "Google Business Profile",
        capabilities: ["source_discovery", "reviews", "sync"],
      },
      update: { status: "ACTIVE" },
      select: { id: true },
    });

    const state = await createOAuthState(account.id, integration.id);
    const url = buildGoogleAuthorizationUrl(state);
    const origin = new URL(request.url).origin;
    const configuredRedirect = process.env.GOOGLE_OAUTH_REDIRECT_URI;
    if (!configuredRedirect) {
      url.searchParams.set("redirect_uri", new URL("/api/integrations/google/callback", origin).toString());
    }

    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json(
      { error: message === "UNAUTHENTICATED" ? "Unauthorized" : "Unable to start Google connection" },
      { status: message === "UNAUTHENTICATED" ? 401 : 500 },
    );
  }
}
