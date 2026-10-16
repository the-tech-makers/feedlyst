"use client";

import { useEffect, useRef, useState } from "react";
import { getReviewViewModels, type ReviewData } from "@/lib/widgets/renderer";

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
type PreviewViewport = "desktop" | "tablet" | "mobile";

const defaults: Config = { layout: "grid", theme: "light", showRating: true, showAuthor: true, showDate: true, showAvatar: true, maxReviews: 6, minRating: 1 };
const viewportWidths: Record<PreviewViewport, string> = {
  desktop: "max-w-none",
  tablet: "max-w-3xl",
  mobile: "max-w-sm",
};

export default function WidgetEditor({ widget, sources, previewReviews }: {
  widget: { id: string; name: string; projectName: string; sourceIds: string[]; configuration: unknown; publication: { publicKey: string; status: string; allowedDomains: unknown } | null };
  sources: { id: string; name: string; externalId: string }[];
  previewReviews: ReviewData[];
}) {
  const [name, setName] = useState(widget.name);
  const [sourceIds, setSourceIds] = useState(widget.sourceIds);
  const [config, setConfig] = useState<Config>({ ...defaults, ...(widget.configuration as Partial<Config>) });
  const [status, setStatus] = useState("Saved");
  const [publishing, setPublishing] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");
  const didMount = useRef(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const timer = window.setTimeout(async () => {
      setStatus("Saving…");
      try {
        const response = await fetch(`/api/widgets/${widget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, sourceIds, configuration: config }) });
        setStatus(response.ok ? "Saved" : "Save failed");
      } catch { setStatus("Save failed"); }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [widget.id, name, sourceIds, config]);

  async function publish() {
    setPublishing(true);
    setStatus("Publishing…");
    try {
      const response = await fetch(`/api/widgets/${widget.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish" }) });
      setStatus(response.ok ? "Published" : "Publish failed");
    } catch { setStatus("Publish failed"); }
    setPublishing(false);
  }

  const visibleReviews = getReviewViewModels(previewReviews, config);
  function toggleSource(id: string) { setSourceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-slate-500">{widget.projectName}</p><h1 className="text-2xl font-semibold text-slate-950">Edit {widget.name}</h1></div><div className="flex items-center gap-3"><span role="status" aria-live="polite" className="text-sm text-slate-500">{status}</span>{widget.publication?.status === "PUBLISHED" && <a href={`/dashboard/widgets/${widget.id}/installation`} className="rounded-lg border px-4 py-2 text-sm">Install</a>}<button onClick={publish} disabled={publishing} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{publishing ? "Publishing…" : "Publish"}</button></div></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm">
        <label className="block"><span className="text-sm font-medium">Widget name</span><input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
        <fieldset><legend className="text-sm font-medium">Sources</legend><div className="mt-2 space-y-2">{sources.length === 0 && <p className="text-sm text-slate-500">No connected sources yet.</p>}{sources.map((source) => <label key={source.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" checked={sourceIds.includes(source.id)} onChange={() => toggleSource(source.id)} /><span>{source.name}</span></label>)}</div></fieldset>
        <label className="block"><span className="text-sm font-medium">Layout</span><select value={config.layout} onChange={(e) => setConfig({ ...config, layout: e.target.value as Config["layout"] })} className="mt-2 w-full rounded-lg border px-3 py-2"><option value="grid">Grid</option><option value="list">List</option><option value="carousel">Carousel</option></select></label>
        <label className="block"><span className="text-sm font-medium">Theme</span><select value={config.theme} onChange={(e) => setConfig({ ...config, theme: e.target.value as Config["theme"] })} className="mt-2 w-full rounded-lg border px-3 py-2"><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option></select></label>
        <label className="block"><span className="text-sm font-medium">Maximum reviews</span><input type="number" min={1} max={50} value={config.maxReviews} onChange={(e) => setConfig({ ...config, maxReviews: Number(e.target.value) })} className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
        <label className="block"><span className="text-sm font-medium">Minimum rating</span><select value={config.minRating} onChange={(e) => setConfig({ ...config, minRating: Number(e.target.value) as Config["minRating"] })} className="mt-2 w-full rounded-lg border px-3 py-2">{[1,2,3,4,5].map((rating) => <option key={rating} value={rating}>{rating}+ stars</option>)}</select></label>
        <div className="space-y-2">{([["showRating","Rating"],["showAuthor","Author"],["showDate","Date"],["showAvatar","Avatar"]] as const).map(([key,label]) => <label key={key} className="flex items-center justify-between text-sm"><span>{label}</span><input type="checkbox" checked={config[key]} onChange={(e) => setConfig({ ...config, [key]: e.target.checked })} /></label>)}</div>
      </aside>
      <section aria-label="Widget preview" className="min-w-0 rounded-2xl border bg-slate-100 p-3 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold text-slate-900">Live preview</h2><p className="text-xs text-slate-500">Check how the widget fits different screen sizes.</p></div>
          <div className="inline-flex rounded-lg border bg-white p-1" role="group" aria-label="Preview screen size">
            {(["desktop", "tablet", "mobile"] as const).map((viewport) => <button key={viewport} type="button" aria-pressed={previewViewport === viewport} onClick={() => setPreviewViewport(viewport)} className={`rounded-md px-3 py-2 text-sm capitalize transition ${previewViewport === viewport ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{viewport}</button>)}
          </div>
        </div>
        <div className={`mx-auto min-w-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-[max-width] duration-200 ${viewportWidths[previewViewport]}`}>
          <div className={`min-h-[520px] p-4 sm:p-6 ${config.theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-950"}`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">{name || "Review widget"}</h3><p className="text-sm opacity-60">Preview · {previewViewport}</p></div>{config.showRating && <span aria-label="Average rating" className="rounded-full bg-black/5 px-3 py-1 text-sm">★ 4.8</span>}</div>
            {visibleReviews.length === 0 ? <div role="status" className="rounded-xl border border-dashed p-8 text-center"><p className="font-medium">No reviews match these settings.</p><p className="mt-1 text-sm opacity-60">Try lowering the minimum rating or syncing a source.</p></div> : <div className={config.layout === "list" ? "space-y-3" : config.layout === "carousel" ? "flex gap-4 overflow-x-auto pb-2" : "grid gap-4 sm:grid-cols-2"}>{visibleReviews.map((review) => <article key={review.id} className={`min-w-0 rounded-xl border border-current/10 p-4 sm:p-5 ${config.layout === "carousel" ? "min-w-[240px] sm:min-w-[280px]" : ""}`}>{config.showAvatar && (review.authorImageUrl ? <img src={review.authorImageUrl} alt="" className="mb-3 h-9 w-9 rounded-full object-cover" /> : <div aria-hidden="true" className="mb-3 h-9 w-9 rounded-full bg-current/10" />)}{config.showRating && review.rating != null && <div aria-label={`${review.rating} out of 5 stars`} className="text-sm">{"★".repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}</div>}{review.title && <h4 className="mt-2 font-medium">{review.title}</h4>}{review.body && <p className="mt-2 break-words text-sm opacity-80">{review.body}</p>}{config.showAuthor && review.authorName && <p className="mt-3 text-xs font-medium">{review.authorName}</p>}{config.showDate && review.formattedDate && <time className="mt-1 block text-xs opacity-50" dateTime={review.publishedAt ? new Date(review.publishedAt).toISOString() : undefined}>{review.formattedDate}</time>}</article>)}</div>}
          </div>
        </div>
      </section>
    </div>
  </div></main>;
}
