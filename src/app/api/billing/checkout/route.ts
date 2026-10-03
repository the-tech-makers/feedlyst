import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRazorpaySubscription } from "@/lib/billing/service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const planId = typeof body.planId === "string" ? body.planId : "";
    if (!planId) return NextResponse.json({ error: "PLAN_REQUIRED" }, { status: 400 });

    const membership = await db.membership.findFirst({ where: { userId: user.id }, select: { accountId: true } });
    if (!membership) return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });

    const plan = await db.plan.findFirst({ where: { id: planId, status: "ACTIVE" }, select: { id: true } });
    if (!plan) return NextResponse.json({ error: "PLAN_NOT_FOUND" }, { status: 404 });

    const current = await db.subscription.findFirst({
      where: { accountId: membership.accountId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] } },
      select: { id: true },
    });
    if (current) return NextResponse.json({ error: "ACTIVE_SUBSCRIPTION_EXISTS" }, { status: 409 });

    const remote = await createRazorpaySubscription({ planId, accountId: membership.accountId });
    const subscription = await db.subscription.create({
      data: {
        accountId: membership.accountId,
        planId,
        provider: "razorpay",
        providerSubscriptionId: remote.id,
        status: remote.status === "active" ? "ACTIVE" : "TRIALING",
        currentPeriodStart: remote.current_start ? new Date(remote.current_start * 1000) : undefined,
        currentPeriodEnd: remote.current_end ? new Date(remote.current_end * 1000) : undefined,
      },
      select: { id: true, status: true, providerSubscriptionId: true },
    });

    return NextResponse.json({ subscription, checkoutUrl: remote.short_url ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "RAZORPAY_NOT_CONFIGURED") {
      return NextResponse.json({ error: "PAYMENT_PROVIDER_NOT_CONFIGURED" }, { status: 503 });
    }
    if (message.startsWith("RAZORPAY_")) {
      return NextResponse.json({ error: "PAYMENT_PROVIDER_ERROR" }, { status: 502 });
    }
    return NextResponse.json({ error: "Unable to create checkout" }, { status: 500 });
  }
}
