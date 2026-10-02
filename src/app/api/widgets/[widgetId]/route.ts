import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { publishReviewWidget, updateReviewWidgetDraft } from "@/lib/widgets/service";
import { publishWidget, setAllowedDomains } from "@/lib/publishing/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  try {
    const user = await requireUser();
    const { widgetId } = await params;
    const input = (await request.json()) as {
      name?: string;
      sourceIds?: string[];
      configuration?: unknown;
    };
    const draft = await updateReviewWidgetDraft({ widgetId, userId: user.id, ...input });
    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: message === "WIDGET_NOT_FOUND" ? 404 : 400 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  try {
    const user = await requireUser();
    const { widgetId } = await params;
    const input = (await request.json().catch(() => ({}))) as { action?: string; domains?: string[] };

    if (input.action === "publish") {
      await publishReviewWidget(widgetId, user.id);
      const publication = await publishWidget(widgetId, user.id);
      return NextResponse.json({ publication });
    }

    if (input.action === "domains") {
      const publication = await setAllowedDomains(widgetId, user.id, input.domains ?? []);
      return NextResponse.json({ publication });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: message === "WIDGET_NOT_FOUND" ? 404 : 400 });
  }
}
