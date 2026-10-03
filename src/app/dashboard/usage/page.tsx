import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentMonthUsage } from "@/lib/usage/service";

export default async function UsagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const membership = await db.membership.findFirst({ where: { userId: session.user.id }, select: { accountId: true } });
  if (!membership) redirect("/dashboard");
  const usage = await getCurrentMonthUsage(membership.accountId);

  return <main className="mx-auto max-w-5xl px-6 py-12">
    <p className="text-sm text-slate-500">Usage</p>
    <h1 className="text-3xl font-semibold">Current month</h1>
    <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Widget loads</p>
      <p className="mt-2 text-4xl font-semibold">{usage.widgetLoads.toLocaleString()}</p>
      <p className="mt-2 text-sm text-slate-500">{usage.periodStart.toLocaleDateString()} – {new Date(usage.periodEnd.getTime() - 1).toLocaleDateString()}</p>
    </div>
  </main>;
}
