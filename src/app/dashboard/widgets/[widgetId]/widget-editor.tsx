"use client";

import { useEffect, useState } from "react";

type Config = {
  layout: "list" | "grid" | "carousel";
  theme: "light" | "dark" | "auto";
  showRating: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showAvatar: boolean;
  maxReviews: number;
  minRating: 1 | 2 | 3 | 4 | 5;
};

const defaults: Config = {
  layout: "grid",
  theme: "light",
  showRating: true,
  showAuthor: true,
  showDate: true,
  showAvatar: true,
  maxReviews: 6,
  minRating: 1,
};

export default function WidgetEditor({
  widget,
  sources,
}: {
  widget: {
    id: string;
    name: string;
    projectName: string;
    sourceIds: string[];
    configuration: unknown;
    publication: { publicKey: string; status: string; allowedDomains: unknown } | null;
  };
  sources: { id: string; name: string; externalId: string }[];
}) {
  const [name, setName] = useState(widget.name);
  const [sourceIds, setSourceIds] = useState(widget.sourceIds);
  const [config, setConfig] = useState<Config>({ ...defaults, ...(widget.configuration as Partial<Config>) });
  const [status, setStatus] = useState("Saved");
  const [publishing, setPublishing] = useState(false);

  const [hydrated, setHydrated] = useState(false);\n\n  useEffect(() => {\n    setHydrated(true);\n  }, []);\n\n  useEffect(() => {\n    if (!hydrated) return;\n    const timer = window.setTimeout(async () => {\n      setStatus("Saving…");\n      try {\n        const response = await fetch(`/api/widgets/${widget.id}`, {\n          method: "PATCH",\n          headers: { "Content-Type": "application/json" },\n          body: JSON.stringify({ name, sourceIds, configuration: config }),\n        });\n        setStatus(response.ok ? "Saved" : "Save failed");\n      } catch {\n        setStatus("Save failed");\n      }\n    }, 500);\n    return () => window.clearTimeout(timer);\n  }, [hydrated, widget.id, name, sourceIds, config]);

  async function publish() {
    setPublishing(true);
    setStatus("Publishing…");
    const response = await fetch(`/api/widgets/${widget.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    setStatus(response.ok ? "Published" : "Publish failed");
    setPublishing(false);
  }

  function toggleSource(id: string) {
    setSourceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{widget.projectName}</p>
            <h1 className="text-2xl font-semibold text-slate-950">Edit {widget.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{status}</span>
            <button onClick={publish} disabled={publishing} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {publishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm">
            <label className="block">
              <span className="text-sm font-medium">Widget name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2" />
            </label>

            <fieldset>
              <legend className="text-sm font-medium">Sources</legend>
              <div className="mt-2 space-y-2">
                {sources.length === 0 && <p className="text-sm text-slate-500">No connected sources yet.</p>}
                {sources.map((source) => (
                  <label key={source.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                    <input type="checkbox" checked={sourceIds.includes(source.id)} onChange={() => toggleSource(source.id)} />
                    <span>{source.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-medium">Layout</span>
              <select value={config.layout} onChange={(e) => setConfig({ ...config, layout: e.target.value as Config["layout"] })} className="mt-2 w-full rounded-lg border px-3 py-2">
                <option value="grid">Grid</option><option value="list">List</option><option value="carousel">Carousel</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Theme</span>
              <select value={config.theme} onChange={(e) => setConfig({ ...config, theme: e.target.value as Config["theme"] })} className="mt-2 w-full rounded-lg border px-3 py-2">
                <option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Maximum reviews</span>
              <input type="number" min={1} max={50} value={config.maxReviews} onChange={(e) => setConfig({ ...config, maxReviews: Number(e.target.value) })} className="mt-2 w-full rounded-lg border px-3 py-2" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Minimum rating</span>
              <select value={config.minRating} onChange={(e) => setConfig({ ...config, minRating: Number(e.target.value) as Config["minRating"] })} className="mt-2 w-full rounded-lg border px-3 py-2">
                {[1,2,3,4,5].map((rating) => <option key={rating} value={rating}>{rating}+ stars</option>)}
              </select>
            </label>

            <div className="space-y-2">
              {([["showRating","Rating"],["showAuthor","Author"],["showDate","Date"],["showAvatar","Avatar"]] as const).map(([key,label]) => (
                <label key={key} className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <input type="checkbox" checked={config[key]} onChange={(e) => setConfig({ ...config, [key]: e.target.checked })} />
                </label>
              ))}
            </div>
          </aside>

          <section className={`min-h-[560px] rounded-2xl border p-6 shadow-sm ${config.theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-950"}`}>
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{name || "Review widget"}</h2>
                  <p className="text-sm opacity-60">Live editor preview</p>
                </div>
                {config.showRating && <span className="rounded-full bg-black/5 px-3 py-1 text-sm">★ 4.8</span>}
              </div>
              <div className={config.layout === "list" ? "space-y-3" : "grid gap-4 sm:grid-cols-2"}>
                {Array.from({ length: Math.min(config.maxReviews, 6) }).map((_, index) => (
                  <article key={index} className="rounded-xl border border-current/10 p-5">
                    {config.showAvatar && <div className="mb-3 h-9 w-9 rounded-full bg-current/10" />}
                    {config.showRating && <div className="text-sm">★★★★★</div>}
                    <p className="mt-2 text-sm opacity-80">A realistic preview of a customer review will appear here.</p>
                    {config.showAuthor && <p className="mt-3 text-xs font-medium">Customer {index + 1}</p>}
                    {config.showDate && <p className="mt-1 text-xs opacity-50">Recently</p>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
