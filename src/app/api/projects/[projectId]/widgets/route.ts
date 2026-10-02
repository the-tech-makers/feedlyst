import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createReviewWidget } from "@/lib/widgets/service";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await db.project.findFirst({
      where: { id: projectId, account: { memberships: { some: { userId: user.id } } } },
      select: { id: true },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const widgets = await db.widget.findMany({
      where: { projectId, type: "review" },
      orderBy: { createdAt: "desc" },
      include: {
        sources: { select: { sourceId: true, sortOrder: true } },
        versions: { orderBy: { versionNumber: "desc" }, take: 2 },
        publication: { select: { publicKey: true, status: true } },
      },
    });
    return NextResponse.json({ widgets });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const input = (await request.json()) as {
      name?: string;
      sourceIds?: string[];
      configuration?: unknown;
    };
    if (!input.name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const widget = await createReviewWidget({
      projectId,
      userId: user.id,
      name: input.name,
      sourceIds: input.sourceIds,
      configuration: input.configuration,
    });
    return NextResponse.json({ widget }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = ["PROJECT_NOT_FOUND", "SOURCE_NOT_FOUND"].includes(message) ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
