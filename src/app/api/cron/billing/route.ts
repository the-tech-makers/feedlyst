import { NextResponse } from "next/server";
import {
  listReconciliationCandidates,
  reconcileRazorpayPayments,
  reconcileRazorpaySubscription,
} from "@/lib/billing/service";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const candidates = await listReconciliationCandidates();
  let subscriptions = 0;
  let payments = 0;
  for (const candidate of candidates) {
    if (!candidate.providerSubscriptionId) continue;
    try {
      await reconcileRazorpaySubscription(candidate.providerSubscriptionId);
      payments += await reconcileRazorpayPayments(candidate.providerSubscriptionId);
      subscriptions++;
    } catch (error) {
      console.error("billing reconciliation failed", {
        subscriptionId: candidate.id,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return NextResponse.json({ subscriptions, payments });
}
