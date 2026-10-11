import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: "◫", active: true },
  { label: "Reviews", href: "/dashboard/reviews", icon: "✳", count: "0" },
  { label: "Widgets", href: "/dashboard/widgets", icon: "▧", count: "0" },
  { label: "Sources", href: "/dashboard/sources", icon: "↗" },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await db.project.findMany({
    where: { account: { memberships: { some: { userId: session.user.id } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true, websiteUrl: true, status: true },
  });

  const project = projects[0];
  const [reviewCount, publishedWidgetCount] = await Promise.all([
    db.review.count({
      where: {
        source: {
          connection: {
            account: {
              memberships: { some: { userId: session.user.id } },
            },
          },
        },
      },
    }),
    db.widget.count({
      where: {
        type: "review",
        publication: { is: { status: "PUBLISHED" } },
        project: { account: { memberships: { some: { userId: session.user.id } } } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#10233f]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
          <Link href="/" className="flex items-center gap-3 px-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#3867f4] text-lg font-bold text-white shadow-md shadow-blue-200">f</span><span className="text-xl font-bold tracking-tight">feedlyst<span className="text-[#3867f4]">.</span></span></Link>
          <div className="mt-9 rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Current workspace</p><div className="mt-3 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">{(project?.name ?? "W").slice(0,1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{project?.name ?? "Your workspace"}</p><p className="mt-0.5 truncate text-xs text-slate-500">Free workspace</p></div><span className="text-slate-400">⌄</span></div></div>
          <p className="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <nav className="space-y-1" aria-label="Workspace navigation">
            {navigation.map((item) => <a key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${item.active ? "bg-blue-50 text-[#315de0]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><span className="grid size-6 place-items-center text-base">{item.icon}</span><span className="flex-1">{item.label}</span>{item.count ? <span className={`rounded-lg px-2 py-0.5 text-[11px] ${item.active ? "bg-white text-blue-700" : "bg-slate-100 text-slate-500"}`}>{item.count}</span> : null}</a>)}
          </nav>
          <div className="mt-auto rounded-2xl bg-[#13264a] p-4 text-white"><span className="grid size-9 place-items-center rounded-xl bg-white/10 text-lg">✦</span><h3 className="mt-4 text-sm font-bold">Make trust visible</h3><p className="mt-2 text-xs leading-5 text-blue-100/70">Connect your first source to start collecting customer stories.</p><a href="/dashboard/sources" className="mt-4 flex items-center justify-center rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-[#13264a] transition hover:bg-blue-50">Connect a source →</a></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200/80 bg-white px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-[#3867f4] font-bold text-white">f</span><span className="font-bold tracking-tight">feedlyst.</span></div>
              <div className="hidden lg:block"><p className="text-xs font-medium text-slate-400">Workspace / Overview</p><p className="mt-1 text-sm font-bold">{project?.name ?? "Your workspace"}</p></div>
              <div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold">{session.user.name ?? "Welcome back"}</p><p className="mt-0.5 text-xs text-slate-500">{session.user.email}</p></div><span className="grid size-10 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{(session.user.name ?? session.user.email ?? "F").slice(0,1).toUpperCase()}</span><form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}><button type="submit" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">Sign out</button></form></div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#3867f4]">Your overview</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Good to have you here{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Your workspace is ready. Connect a source to start bringing customer feedback into Feedlyst.</p></div>
              <a href="/dashboard/sources" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3867f4] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">＋ Connect a source</a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: "Projects", value: String(projects.length), detail: "Your organized workspaces", icon: "▦", tone: "bg-indigo-50 text-indigo-700" },
                { label: "Reviews collected", value: String(reviewCount), detail: "Customer stories in your library", icon: "✳", tone: "bg-amber-50 text-amber-700" },
                { label: "Published widgets", value: String(publishedWidgetCount), detail: "Social proof on your website", icon: "▧", tone: "bg-emerald-50 text-emerald-700" },
              ].map((metric) => <article key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{metric.label}</p><span className={`grid size-10 place-items-center rounded-xl text-lg ${metric.tone}`}>{metric.icon}</span></div><p className="mt-5 text-3xl font-bold tracking-tight">{metric.value}</p><p className="mt-1.5 text-xs text-slate-400">{metric.detail}</p></article>)}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-7">
                <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">Get started with Feedlyst</h2><p className="mt-1.5 text-sm text-slate-500">Three simple steps to publish your first widget.</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">0 of 3 complete</span></div>
                <div className="mt-7 space-y-3">
                  {[
                    { n: "01", title: "Connect a review source", description: "Bring customer feedback into your workspace.", href: "/dashboard/sources", action: "Connect source" },
                    { n: "02", title: "Curate your reviews", description: "Choose the stories you want to share.", href: "/dashboard/reviews", action: "Explore reviews" },
                    { n: "03", title: "Create and publish a widget", description: "Display your selected reviews on your website.", href: "/dashboard/widgets", action: "Build widget" },
                  ].map((step) => <div key={step.n} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-xs font-bold text-slate-400">{step.n}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{step.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p></div><a href={step.href} className="shrink-0 text-left text-xs font-bold text-[#3867f4] hover:text-blue-800">{step.action} →</a></div>)}
                </div>
              </section>

              <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-7">
                <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-lg text-violet-700">✦</span><div><h2 className="font-bold">Your first project</h2><p className="mt-1 text-xs text-slate-500">Workspace setup</p></div></div>
                {project ? <><div className="mt-6 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">PROJECT NAME</p><p className="mt-2 break-words text-sm font-bold">{project.name}</p><p className="mt-3 text-xs text-slate-500">{project.websiteUrl ?? "Add your website URL when you’re ready."}</p></div><div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-500">Status</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{project.status}</span></div></> : <div className="mt-6 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold">No project yet</p><p className="mt-2 text-xs leading-5 text-slate-500">Your project will appear here after setup.</p></div>}
                <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs leading-5 text-slate-500">Need to change your project details? Project settings will be available as you continue setting up your workspace.</p></div>
              </aside>
            </div>
            <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>Feedlyst · Your social proof workspace</span><Link href="/" className="font-semibold hover:text-slate-600">Visit homepage ↗</Link></footer>
          </div>
        </section>
      </div>
    </main>
  );
}
