import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUsageStatus } from "@/lib/usage/service";

export default async function UsagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const membership = await db.membership.findFirst({ where: { userId: session.user.id }, select: { accountId: true } });
  if (!membership) redirect("/dashboard");
  const usage = await getUsageStatus(membership.accountId);
  const remaining = usage.remaining ?? 0;
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <p className="text-sm text-slate-500">Usage</p><h1 className="text-3xl font-semibold">Current month</h1>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Widget loads</p><p className="mt-2 text-4xl font-semibold">{usage.widgetLoads.toLocaleString()}</p></div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Monthly limit</p><p className="mt-2 text-4xl font-semibold">{usage.limit == null ? "Unlimited" : usage.limit.toLocaleString()}</p>{usage.limit != null && <p className="mt-2 text-sm text-slate-500">{remaining.toLocaleString()} remaining</p>}</div>
    </div>
    {usage.exceeded && <div role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your current monthly widget-load limit has been reached.</div>}
  </main>;
}
