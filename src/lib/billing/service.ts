import "server-only";

/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma JSON fields accept runtime provider metadata. */
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import type { billing_interval, subscription_status } from "@/generated/prisma/client";
import { verifyRazorpayWebhookSignature } from "@/lib/billing/security";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function razorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("RAZORPAY_NOT_CONFIGURED");
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

async function razorpayRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${RAZORPAY_API}${path}`, {
    ...init,
    headers: {
      Authorization: razorpayAuth(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  let body: unknown = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { error: text }; }
  if (!response.ok) {
    throw new Error(`RAZORPAY_${response.status}:${JSON.stringify(body).slice(0, 500)}`);
  }
  return body as T;
}

type RazorpayPlan = { id: string };
type RazorpaySubscription = {
  id: string;
  status: string;
  short_url?: string | null;
  current_start?: number | null;
  current_end?: number | null;
  plan_id?: string | null;
  notes?: Record<string, string>;
};
type RazorpayPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
  created_at?: number;
  notes?: Record<string, string>;
};

function unixDate(value?: number | null) {
  return value ? new Date(value * 1000) : undefined;
}

export async function listActivePlans() {
  return db.plan.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ priceMinor: "asc" }, { billingInterval: "asc" }],
    select: { id: true, key: true, name: true, limits: true, priceMinor: true, currency: true, billingInterval: true },
  });
}

export async function listRecentPayments(accountId: string, limit = 10) {
  return db.payment.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 50),
    select: {
      id: true,
      providerPaymentId: true,
      amountMinor: true,
      currency: true,
      status: true,
      paidAt: true,
      createdAt: true,
    },
  });
}

export async function getCurrentSubscription(accountId: string) {
  return db.subscription.findFirst({
    where: { accountId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] } },
    orderBy: { createdAt: "desc" },
    include: { plan: { select: { id: true, key: true, name: true, limits: true, priceMinor: true, currency: true, billingInterval: true } } },
  });
}

export async function setSubscriptionStatus(
  subscriptionId: string,
  status: subscription_status,
  period?: { start?: Date; end?: Date },
) {
  return db.subscription.update({
    where: { id: subscriptionId },
    data: {
      status,
      ...(period?.start ? { currentPeriodStart: period.start } : {}),
      ...(period?.end ? { currentPeriodEnd: period.end } : {}),
    },
  });
}

export async function recordPayment(input: {
  accountId: string;
  subscriptionId?: string;
  provider: string;
  providerPaymentId: string;
  amountMinor: bigint;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  paidAt?: Date;
  metadata?: Record<string, unknown>;
}) {
  return db.payment.upsert({
    where: { provider_providerPaymentId: { provider: input.provider, providerPaymentId: input.providerPaymentId } },
    create: {
      accountId: input.accountId,
      subscriptionId: input.subscriptionId,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: input.status,
      paidAt: input.paidAt,
      // Razorpay metadata is JSON-shaped and Prisma's generated JSON type is intentionally broader here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Razorpay metadata is JSON-shaped and Prisma's generated JSON type is intentionally broader here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: (input.metadata ?? {}) as any,
    },
    update: {
      subscriptionId: input.subscriptionId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: input.status,
      paidAt: input.paidAt,
      metadata: (input.metadata ?? {}) as any,
    },
  });
}

export async function ensureRazorpayPlan(planId: string) {
  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan || plan.status !== "ACTIVE") throw new Error("PLAN_NOT_FOUND");
  if (plan.providerPlanId) return plan.providerPlanId;

  const created = await razorpayRequest<RazorpayPlan>("/plans", {
    method: "POST",
    body: JSON.stringify({
      period: plan.billingInterval === "YEARLY" ? "yearly" : "monthly",
      interval: 1,
      item: {
        name: plan.name,
        amount: Number(plan.priceMinor),
        currency: plan.currency,
        description: `Feedlyst ${plan.name}`,
      },
      notes: { feedlyst_plan_id: plan.id },
    }),
  });

  const saved = await db.plan.updateMany({
    where: { id: plan.id, providerPlanId: null },
    data: { providerPlanId: created.id },
  });
  if (saved.count === 0) {
    const latest = await db.plan.findUniqueOrThrow({ where: { id: plan.id }, select: { providerPlanId: true } });
    return latest.providerPlanId!;
  }
  return created.id;
}

export async function createRazorpaySubscription(input: { planId: string; accountId: string }) {
  const providerPlanId = await ensureRazorpayPlan(input.planId);
  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: providerPlanId,
      total_count: 120,
      customer_notify: 1,
      notes: { feedlyst_account_id: input.accountId, feedlyst_plan_id: input.planId },
    }),
  });
}

export async function cancelRazorpaySubscription(subscriptionId: string, atCycleEnd = true) {
  const remote = await razorpayRequest<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancel_at_cycle_end: atCycleEnd }),
  });
  const local = await db.subscription.findFirst({ where: { provider: "razorpay", providerSubscriptionId: subscriptionId } });
  if (local && !atCycleEnd) {
    await db.subscription.update({ where: { id: local.id }, data: { status: "CANCELLED", cancelAt: new Date() } });
  } else if (local) {
    await db.subscription.update({ where: { id: local.id }, data: { cancelAt: unixDate(remote.current_end) } });
  }
  return remote;
}

export async function reconcileRazorpaySubscription(subscriptionId: string) {
  const remote = await razorpayRequest<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
  const local = await db.subscription.findFirst({ where: { provider: "razorpay", providerSubscriptionId: remote.id } });
  if (!local) return null;

  const statusMap: Record<string, subscription_status> = {
    created: "TRIALING",
    authenticated: "TRIALING",
    active: "ACTIVE",
    pending: "PAST_DUE",
    halted: "PAST_DUE",
    paused: "PAST_DUE",
    cancelled: "CANCELLED",
    completed: "EXPIRED",
    expired: "EXPIRED",
  };
  return db.subscription.update({
    where: { id: local.id },
    data: {
      status: statusMap[remote.status] ?? local.status,
      currentPeriodStart: unixDate(remote.current_start),
      currentPeriodEnd: unixDate(remote.current_end),
    },
  });
}

export async function reconcileRazorpayPayments(subscriptionId: string) {
  const local = await db.subscription.findFirst({ where: { provider: "razorpay", providerSubscriptionId: subscriptionId } });
  if (!local) return 0;
  const response = await razorpayRequest<{ items?: RazorpayPayment[] }>(`/subscriptions/${encodeURIComponent(subscriptionId)}/transactions`);
  let count = 0;
  for (const payment of response.items ?? []) {
    await recordPayment({
      accountId: local.accountId,
      subscriptionId: local.id,
      provider: "razorpay",
      providerPaymentId: payment.id,
      amountMinor: BigInt(payment.amount),
      currency: payment.currency,
      status: payment.status === "captured" || payment.captured ? "SUCCEEDED" : payment.status === "failed" ? "FAILED" : "PENDING",
      paidAt: unixDate(payment.created_at),
      metadata: { reconciled: true, remoteStatus: payment.status },
    });
    count++;
  }
  return count;
}

export async function processRazorpayWebhook(input: { rawBody: string; signature: string }) {
  if (!verifyRazorpayWebhookSignature(input.rawBody, input.signature)) throw new Error("INVALID_WEBHOOK_SIGNATURE");
  const payload = JSON.parse(input.rawBody) as Record<string, unknown>;
  const eventType = typeof payload.event === "string" ? payload.event : "";
  const providerEventId = typeof payload.id === "string"
    ? payload.id
    : createHash("sha256").update(input.rawBody).digest("hex");

  const existing = await db.billingWebhookEvent.findUnique({
    where: { provider_providerEventId: { provider: "razorpay", providerEventId } },
  });
  if (existing?.processedAt) return { duplicate: true };

  const event = existing ?? await db.billingWebhookEvent.create({
    data: { provider: "razorpay", providerEventId, eventType, payload: payload as unknown as Record<string, unknown> },
  });

  try {
    const webhookPayload = payload.payload as { subscription?: { entity?: RazorpaySubscription }; payment?: { entity?: RazorpayPayment } } | undefined;
    const subscriptionEntity = webhookPayload?.subscription?.entity;
    const paymentEntity = webhookPayload?.payment?.entity;
    const accountId = subscriptionEntity?.notes?.feedlyst_account_id;
    let localSubscription = subscriptionEntity?.id
      ? await db.subscription.findFirst({ where: { provider: "razorpay", providerSubscriptionId: subscriptionEntity.id } })
      : null;

    if (!localSubscription && accountId && subscriptionEntity?.id && subscriptionEntity.plan_id) {
      const plan = await db.plan.findFirst({ where: { providerPlanId: subscriptionEntity.plan_id } });
      if (plan) {
        localSubscription = await db.subscription.create({
          data: {
            accountId,
            planId: plan.id,
            provider: "razorpay",
            providerSubscriptionId: subscriptionEntity.id,
            status: "TRIALING",
          },
        });
      }
    }

    if (localSubscription && subscriptionEntity) {
      const statusMap: Record<string, subscription_status> = {
        created: "TRIALING", authenticated: "TRIALING", active: "ACTIVE",
        pending: "PAST_DUE", halted: "PAST_DUE", paused: "PAST_DUE",
        cancelled: "CANCELLED", completed: "EXPIRED", expired: "EXPIRED",
      };
      await db.subscription.update({
        where: { id: localSubscription.id },
        data: {
          status: statusMap[subscriptionEntity.status] ?? localSubscription.status,
          currentPeriodStart: unixDate(subscriptionEntity.current_start),
          currentPeriodEnd: unixDate(subscriptionEntity.current_end),
        },
      });
    }

    if (paymentEntity && localSubscription) {
      const status = paymentEntity.status === "captured" || paymentEntity.captured ? "SUCCEEDED"
        : paymentEntity.status === "failed" ? "FAILED" : "PENDING";
      await recordPayment({
        accountId: localSubscription.accountId,
        subscriptionId: localSubscription.id,
        provider: "razorpay",
        providerPaymentId: paymentEntity.id,
        amountMinor: BigInt(paymentEntity.amount),
        currency: paymentEntity.currency,
        status,
        paidAt: unixDate(paymentEntity.created_at),
        metadata: { event: eventType, webhook: true },
      });
    }

    await db.billingWebhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date(), error: null, accountId: localSubscription?.accountId ?? accountId ?? null },
    });
    return { duplicate: false };
  } catch (error) {
    await db.billingWebhookEvent.update({
      where: { id: event.id },
      data: { error: error instanceof Error ? error.message : "WEBHOOK_PROCESSING_FAILED" },
    });
    throw error;
  }
}

export async function listReconciliationCandidates() {
  return db.subscription.findMany({
    where: { provider: "razorpay", providerSubscriptionId: { not: null }, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] } },
    select: { id: true, providerSubscriptionId: true },
    take: 50,
    orderBy: { updatedAt: "asc" },
  });
}

export function formatPlanPrice(priceMinor: bigint, currency: string, interval: billing_interval) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(priceMinor) / 100) +
    (interval === "YEARLY" ? "/year" : "/month");
}
