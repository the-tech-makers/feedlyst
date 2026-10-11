import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import CreateWidgetForm from "./create-widget-form";

export default async function WidgetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await db.project.findMany({
    where: { status: "ACTIVE", account: { memberships: { some: { userId: session.user.id } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  const widgets = await db.widget.findMany({
    where: { type: "review", project: { account: { memberships: { some: { userId: session.user.id } } } } },
    orderBy: { updatedAt: "desc" },
    include: {
      project: { select: { name: true } },
      publication: { select: { publicKey: true, status: true } },
      versions: { where: { state: "DRAFT" }, take: 1, select: { id: true } },
      _count: { select: { sources: true } },
    },
  });

  return <main className="min-h-screen bg-[#f6f8fc] text-[#10233f]"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10"><Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link><div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#3867f4]">Workspace / Widgets</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Website widgets</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Create review widgets, choose their content and layout, then publish an embeddable version for your site.</p></div><span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{widgets.length} widget{widgets.length === 1 ? "" : "s"}</span></div>{projects.length ? <CreateWidgetForm projects={projects} /> : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Create a project first to start a widget.</div>}{widgets.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">▧</span><h2 className="mt-5 text-lg font-bold">Your first widget starts here</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Create a review widget, customize its appearance, and publish it when you’re ready.</p></div> : <div className="mt-6 grid gap-4 md:grid-cols-2">{widgets.map((widget) => <article key={widget.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-lg text-violet-700">▧</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${widget.publication?.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{widget.publication?.status === "PUBLISHED" ? "Published" : "Draft"}</span></div><h2 className="mt-4 text-lg font-bold">{widget.name}</h2><p className="mt-1 text-xs text-slate-500">{widget.project.name}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">{widget._count.sources} source{widget._count.sources === 1 ? "" : "s"} selected</p><Link href={`/dashboard/widgets/${widget.id}`} className="text-sm font-bold text-[#3867f4] hover:text-blue-800">Open editor →</Link></div></article>)}</div>}</div></main>;
}
