import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { cancelRazorpaySubscription } from "@/lib/billing/service";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const atCycleEnd = body.atCycleEnd !== false;
    const membership = await db.membership.findFirst({ where: { userId: user.id }, select: { accountId: true } });
    if (!membership) return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });

    const subscription = await db.subscription.findFirst({
      where: { accountId: membership.accountId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] }, provider: "razorpay" },
      orderBy: { createdAt: "desc" },
      select: { id: true, providerSubscriptionId: true },
    });
    if (!subscription?.providerSubscriptionId) return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 });

    await cancelRazorpaySubscription(subscription.providerSubscriptionId, atCycleEnd);
    return NextResponse.json({ cancelled: true, atCycleEnd });
  } catch {
    return NextResponse.json({ error: "Unable to cancel subscription" }, { status: 500 });
  }
}
