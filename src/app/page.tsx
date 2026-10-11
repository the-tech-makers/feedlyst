import Link from "next/link";
const capabilities = [
  {
    number: "01",
    title: "Collect in one place",
    description: "Bring customer reviews and social proof into a workspace your team can manage.",
    icon: "↗",
  },
  {
    number: "02",
    title: "Curate what matters",
    description: "Choose the testimonials and content that best tell your brand’s story.",
    icon: "✳",
  },
  {
    number: "03",
    title: "Publish anywhere",
    description: "Build embeddable widgets that help turn customer trust into action.",
    icon: "▧",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#10233f]">
      <header className="relative z-10 border-b border-slate-100 bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Feedlyst home" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#3867f4] text-lg font-bold text-white shadow-lg shadow-blue-200">f</span>
            <span className="text-xl font-bold tracking-tight">feedlyst<span className="text-[#3867f4]">.</span></span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main navigation">
            <a href="/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 sm:px-4">Sign in</a>
            <a href="/register" className="rounded-xl bg-[#3867f4] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 sm:px-5">Get started <span aria-hidden="true">→</span></a>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -right-40 -top-24 size-[34rem] rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-60 size-80 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
              <span className="size-2 rounded-full bg-blue-500" /> Social proof, made useful
            </div>
            <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Let your customers’ words do the <span className="text-[#3867f4]">talking.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Collect reviews, curate your best stories, and turn them into beautiful website widgets — all from one simple workspace.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/register" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#3867f4] px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">Create your workspace <span aria-hidden="true">→</span></a>
              <a href="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">I already have an account</a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-2"><span className="text-emerald-600">✓</span> One organized workspace</span>
              <span className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Full control over what you publish</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/50">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-blue-50 font-bold text-blue-700">f</span><div><p className="text-sm font-bold">Workspace overview</p><p className="mt-0.5 text-xs text-slate-400">Your social proof, at a glance</p></div></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Live preview</span>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6">
                {[["Reviews","128","+12 this week"],["Sources","4","Connected"],["Widgets","3","On your site"]].map(([label,value,hint]) => <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p><p className="mt-1 text-[10px] text-slate-400 sm:text-xs">{hint}</p></div>)}
              </div>
              <div className="px-4 pb-5 sm:px-6 sm:pb-7">
                <div className="flex items-center justify-between"><div><p className="text-sm font-bold">Recent customer stories</p><p className="mt-1 text-xs text-slate-400">A preview of curated feedback</p></div><span className="text-xs font-bold text-blue-600">View all →</span></div>
                <div className="mt-4 space-y-3">
                  {[
                    ["AM","Alex Morgan","“The easiest setup we’ve had. It just works.”","★★★★★"],
                    ["SP","Sofia Patel","“A much better way to showcase customer trust.”","★★★★★"],
                  ].map(([initials,name,quote,stars]) => <div key={name} className="flex gap-3 rounded-2xl border border-slate-100 p-3.5 sm:p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{initials}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-1"><p className="text-xs font-bold text-slate-800">{name}</p><span className="text-[10px] tracking-widest text-amber-500">{stars}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{quote}</p></div></div>)}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-600">✓</span><div><p className="text-xs font-bold">You’re in control</p><p className="mt-1 text-[11px] text-slate-500">Review before you publish</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">A simpler workflow</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">From feedback to confidence.</h2><p className="mt-4 leading-7 text-slate-600">Everything you need to manage the stories that make people trust your brand.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilities.map((item) => <article key={item.number} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">{item.icon}</span><span className="text-xs font-bold tracking-[0.16em] text-slate-300">{item.number}</span></div><h3 className="mt-7 text-lg font-bold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p></article>)}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Link href="/" className="font-bold tracking-tight text-slate-600">feedlyst.</Link><p>Thoughtful social proof for your website.</p><div className="flex gap-5"><a className="hover:text-slate-700" href="/login">Sign in</a><a className="hover:text-slate-700" href="/register">Create account</a></div></footer>
    </main>
  );
}
