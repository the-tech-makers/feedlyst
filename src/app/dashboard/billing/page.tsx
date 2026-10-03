import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPlanPrice, getCurrentSubscription, listActivePlans, listRecentPayments } from "@/lib/billing/service";
import { BillingActions } from "./billing-actions";
import { SubscriptionActions } from "./subscription-actions";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const membership = await db.membership.findFirst({ where: { userId: session.user.id }, select: { accountId: true } });
  if (!membership) redirect("/dashboard");

  const [plans, subscription, payments] = await Promise.all([
    listActivePlans(),
    getCurrentSubscription(membership.accountId),
    listRecentPayments(membership.accountId),
  ]);

  return <main className="mx-auto max-w-6xl px-6 py-12">
    <p className="text-sm text-slate-500">Billing</p>
    <h1 className="text-3xl font-semibold text-slate-950">Plans & subscription</h1>
    <p className="mt-2 text-slate-600">Your plan controls the usage limits available to this account.</p>
    <p className="mt-3 text-xs text-slate-500">Checkout is handled securely by Razorpay. Your card or UPI details are never stored by Feedlyst.</p>

    {subscription && <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Current subscription</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{subscription.plan.name}</h2>
        <span className="rounded-full border px-3 py-1 text-sm">{subscription.status}</span>
      </div>
      {subscription.currentPeriodEnd && <p className="mt-2 text-sm text-slate-500">Current period ends {subscription.currentPeriodEnd.toLocaleDateString()}</p>}
    <SubscriptionActions />
    </section>}

    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Payment history</h2>
      {payments.length ? <div className="mt-4 divide-y">
        {payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <div>
            <p className="font-medium text-slate-900">{payment.providerPaymentId}</p>
            <p className="text-slate-500">{(payment.paidAt ?? payment.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: payment.currency }).format(Number(payment.amountMinor) / 100)}</p>
            <p className="text-slate-500">{payment.status}</p>
          </div>
        </div>)}
      </div> : <p className="mt-3 text-sm text-slate-500">No payments have been recorded yet.</p>}
    </section>

    <section className="mt-8 grid gap-5 md:grid-cols-3">
      {plans.map((plan) => <article key={plan.id} className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{plan.name}</h2>
        <p className="mt-3 text-2xl font-semibold">{formatPlanPrice(plan.priceMinor, plan.currency, plan.billingInterval)}</p>
        <dl className="mt-5 space-y-2 text-sm text-slate-600">
          {typeof plan.limits === "object" && plan.limits && !Array.isArray(plan.limits) && Object.entries(plan.limits as Record<string, unknown>).map(([key, value]) =>
            <div key={key} className="flex justify-between gap-4"><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd className="font-medium text-slate-900">{String(value)}</dd></div>
          )}
        </dl>
        <BillingActions planId={plan.id} />
      </article>)}
    </section>

    {!plans.length && <div className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">No plans are configured yet.</div>}
  </main>;
}
