import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const nav = [
  ["Overview", "/dashboard"],
  ["Reviews", "/dashboard/reviews"],
  ["Widgets", "/dashboard/widgets"],
  ["Sources", "/dashboard/sources"],
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r bg-white px-5 py-6 lg:block">
          <div className="text-xl font-semibold tracking-tight">Feedlyst</div>
          <p className="mt-1 text-xs text-slate-500">Social proof workspace</p>
          <nav className="mt-10 space-y-1">
            {nav.map(([label, href], index) => (
              <a
                key={href}
                href={href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${index === 0 ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="border-b bg-white px-6 py-5">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Workspace</p>
                <h1 className="mt-1 text-xl font-semibold">{project?.name ?? "Your workspace"}</h1>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{session.user.name ?? session.user.email ?? "Account"}</p>
                <p className="text-xs text-slate-500">{session.user.email}</p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-sky-600">Overview</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight">Your social proof, in one place.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Connect sources, curate reviews, and publish them through reusable widgets.
                </p>
              </div>
              <a href="/dashboard/sources" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                Connect a source
              </a>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Projects", String(projects.length), "Active workspaces"],
                ["Reviews", "0", "Ready to curate"],
                ["Widgets", "0", "Published experiences"],
              ].map(([label, value, hint]) => (
                <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">{hint}</p>
                </article>
              ))}
            </div>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">Get started</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  ["01", "Connect a source", "Bring reviews into Feedlyst."],
                  ["02", "Curate content", "Choose what your visitors should see."],
                  ["03", "Publish a widget", "Embed your social proof on your site."],
                ].map(([number, title, description]) => (
                  <div key={number} className="rounded-xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-400">{number}</span>
                    <h4 className="mt-4 text-sm font-semibold">{title}</h4>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
