const features = [
  {
    title: "Bring your reviews together",
    description: "Connect review sources and keep your social proof in one workspace.",
  },
  {
    title: "Build your widget",
    description: "Turn selected reviews into a clean, embeddable widget for your website.",
  },
  {
    title: "Publish with control",
    description: "Choose what appears, publish a version, and keep your live widget stable.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <nav className="flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">Feedlyst</span>
          <div className="flex items-center gap-3">
            <a href="/login" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-white/10">
              Sign in
            </a>
            <a href="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200">
              Get started
            </a>
          </div>
        </nav>

        <div className="max-w-3xl pt-24">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
            Reviews. Widgets. Social proof.
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">
            Turn customer feedback into website content.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Feedlyst helps you collect content from connected sources, curate what matters,
            and publish fast, embeddable widgets on your website.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="/register" className="rounded-xl bg-white px-5 py-3 font-medium text-slate-950 hover:bg-slate-200">
              Create your workspace
            </a>
            <a href="/login" className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white hover:bg-white/10">
              Open dashboard
            </a>
          </div>
        </div>

        <div className="mt-24 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
