import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import SourceSyncButton from "./source-sync-button";

export default async function SourcesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const account = await db.account.findFirst({
    where: { memberships: { some: { userId: session.user.id } }, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      connections: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          integration: { select: { key: true, name: true } },
          sources: {
            orderBy: { name: "asc" },
            select: { id: true, name: true, status: true, lastSyncedAt: true, _count: { select: { reviews: true } } },
          },
        },
      },
    },
  });

  const connections = account?.connections ?? [];
  const totalSources = connections.reduce((sum, connection) => sum + connection.sources.length, 0);
  const totalReviews = connections.reduce((sum, connection) => sum + connection.sources.reduce((sourceSum, source) => sourceSum + source._count.reviews, 0), 0);

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#10233f]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link>
        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#3867f4]">Workspace / Sources</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Review sources</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Connect a supported platform, discover your locations, and sync customer reviews into your library.</p></div>
          <a href="/api/integrations/google/connect" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3867f4] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">＋ Connect Google Business Profile</a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[["Connections", String(connections.length)], ["Sources", String(totalSources)], ["Reviews collected", String(totalReviews)]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>)}
        </div>
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Connected platforms</h2><span className="text-xs text-slate-400">{account?.name ?? "Workspace"}</span></div>
          {connections.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700">↗</span><h3 className="mt-5 text-lg font-bold">Connect your first source</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Start with Google Business Profile to discover locations and bring reviews into Feedlyst. You can curate those reviews and use them in website widgets.</p><a href="/api/integrations/google/connect" className="mt-6 inline-flex rounded-xl bg-[#3867f4] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Connect Google Business Profile →</a><p className="mt-4 text-xs text-slate-400">Connecting requires Google OAuth credentials to be configured for this deployment.</p></div> : <div className="space-y-4">{connections.map((connection) => <article key={connection.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700">G</span><div><h3 className="font-bold">{connection.integration.name}</h3><p className="mt-1 text-xs text-slate-500">Connected {connection.createdAt.toLocaleDateString()}</p><p className="mt-1 text-xs text-slate-400">Status: {connection.status}</p></div></div><SourceSyncButton connectionId={connection.id} /></div>{connection.sources.length ? <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">{connection.sources.map((source) => <div key={source.id} className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">{source.name}</p><p className="mt-1 text-xs text-slate-400">{source._count.reviews} reviews · {source.lastSyncedAt ? `Last synced ${source.lastSyncedAt.toLocaleString()}` : "Not synced yet"}</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${source.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{source.status}</span></div>)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No locations discovered yet. Run a sync to find locations and import their reviews.</p>}</article>)}</div>}
        </section>
      </div>
    </main>
  );
}
