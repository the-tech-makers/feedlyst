import { NextResponse } from "next/server";
import { processRazorpayWebhook } from "@/lib/billing/service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  try {
    await processRazorpayWebhook({ rawBody, signature });
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_WEBHOOK_SIGNATURE") {
      return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
    }
    return NextResponse.json({ error: "WEBHOOK_PROCESSING_FAILED" }, { status: 500 });
  }
}
