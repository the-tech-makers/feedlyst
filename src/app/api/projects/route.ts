import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const projects = await db.project.findMany({
      where: { account: { memberships: { some: { userId: user.id } } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: message === "UNAUTHENTICATED" ? "Unauthorized" : "Request failed" }, { status: message === "UNAUTHENTICATED" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = (await request.json()) as { accountId?: string; name?: string; slug?: string; websiteUrl?: string };
    if (!input.accountId || !input.name || !input.slug) return NextResponse.json({ error: "accountId, name and slug are required" }, { status: 400 });

    const membership = await db.membership.findUnique({ where: { accountId_userId: { accountId: input.accountId, userId: user.id } } });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const project = await db.project.create({
      data: { accountId: input.accountId, name: input.name.trim(), slug: input.slug.trim().toLowerCase(), websiteUrl: input.websiteUrl?.trim() || null },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json(
      { error: message === "UNAUTHENTICATED" ? "Unauthorized" : "Request failed" },
      { status: message === "UNAUTHENTICATED" ? 401 : 500 },
    );
  }
}
