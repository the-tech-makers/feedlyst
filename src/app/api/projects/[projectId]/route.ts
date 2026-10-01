import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await db.project.findFirst({
      where: { id: projectId, account: { memberships: { some: { userId: user.id } } } },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const existing = await db.project.findFirst({
      where: { id: projectId, account: { memberships: { some: { userId: user.id } } } },
    });
    if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const input = (await request.json()) as { name?: string; slug?: string; websiteUrl?: string | null; status?: "ACTIVE" | "ARCHIVED" };
    const project = await db.project.update({
      where: { id: projectId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.slug !== undefined ? { slug: input.slug.trim().toLowerCase() } : {}),
        ...(input.websiteUrl !== undefined ? { websiteUrl: input.websiteUrl?.trim() || null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
