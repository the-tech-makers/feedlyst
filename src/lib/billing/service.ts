import "server-only";
import { db } from "@/lib/db";
import type { billing_interval, subscription_status } from "@/generated/prisma/client";

export async function listActivePlans() {
  return db.plan.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ priceMinor: "asc" }, { billingInterval: "asc" }],
    select: { id: true, key: true, name: true, limits: true, priceMinor: true, currency: true, billingInterval: true },
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
      metadata: input.metadata ?? {},
    },
    update: {
      subscriptionId: input.subscriptionId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: input.status,
      paidAt: input.paidAt,
      metadata: input.metadata ?? {},
    },
  });
}

export function formatPlanPrice(priceMinor: bigint, currency: string, interval: billing_interval) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(priceMinor) / 100) +
    (interval === "YEARLY" ? "/year" : "/month");
}
