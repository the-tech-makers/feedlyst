import { NextResponse } from "next/server";
import { enqueueActiveGoogleSources, processSyncJobs } from "@/lib/sync/worker";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const enqueued = await enqueueActiveGoogleSources();
    const processed = await processSyncJobs(10);
    return NextResponse.json({ enqueued, ...processed });
  } catch {
    return NextResponse.json({ error: "Synchronization failed" }, { status: 500 });
  }
}
