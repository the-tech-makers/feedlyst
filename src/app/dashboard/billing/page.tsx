import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPlanPrice, getCurrentSubscription, listActivePlans } from "@/lib/billing/service";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const membership = await db.membership.findFirst({ where: { userId: session.user.id }, select: { accountId: true } });
  if (!membership) redirect("/dashboard");

  const [plans, subscription] = await Promise.all([
    listActivePlans(),
    getCurrentSubscription(membership.accountId),
  ]);

  return <main className="mx-auto max-w-6xl px-6 py-12">
    <p className="text-sm text-slate-500">Billing</p>
    <h1 className="text-3xl font-semibold text-slate-950">Plans & subscription</h1>
    <p className="mt-2 text-slate-600">Your plan controls the usage limits available to this account.</p>

    {subscription && <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Current subscription</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{subscription.plan.name}</h2>
        <span className="rounded-full border px-3 py-1 text-sm">{subscription.status}</span>
      </div>
      {subscription.currentPeriodEnd && <p className="mt-2 text-sm text-slate-500">Current period ends {subscription.currentPeriodEnd.toLocaleDateString()}</p>}
    </section>}

    <section className="mt-8 grid gap-5 md:grid-cols-3">
      {plans.map((plan) => <article key={plan.id} className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{plan.name}</h2>
        <p className="mt-3 text-2xl font-semibold">{formatPlanPrice(plan.priceMinor, plan.currency, plan.billingInterval)}</p>
        <dl className="mt-5 space-y-2 text-sm text-slate-600">
          {typeof plan.limits === "object" && plan.limits && !Array.isArray(plan.limits) && Object.entries(plan.limits as Record<string, unknown>).map(([key, value]) =>
            <div key={key} className="flex justify-between gap-4"><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd className="font-medium text-slate-900">{String(value)}</dd></div>
          )}
        </dl>
        <button disabled className="mt-6 w-full rounded-lg border px-4 py-2 text-sm text-slate-500" title="Payment provider checkout is not connected yet">Choose plan</button>
      </article>)}
    </section>

    {!plans.length && <div className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">No plans are configured yet.</div>}
  </main>;
}
