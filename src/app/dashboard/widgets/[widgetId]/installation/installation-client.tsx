"use client";

import { useState } from "react";

export default function InstallationClient({ widget }: { widget: { id: string; name: string; publication: { publicKey: string; status: string; allowedDomains: unknown } | null } }) {
  const [copied, setCopied] = useState<string | null>(null);
  const publicKey = widget.publication?.publicKey ?? "";
  const isPublished = widget.publication?.status === "PUBLISHED";
  const embedCode = publicKey ? `<script src="${window.location.origin}/embed.js" data-widget-id="${publicKey}" async></script>` : "";
  async function copy(value: string, key: string) { await navigator.clipboard.writeText(value); setCopied(key); window.setTimeout(() => setCopied(null), 1500); }

  return <main className="mx-auto max-w-4xl px-6 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Installation</p><h1 className="text-3xl font-semibold text-slate-950">{widget.name}</h1></div><a href={`/dashboard/widgets/${widget.id}`} className="rounded-lg border px-4 py-2 text-sm">Back to editor</a></div>
    {!isPublished ? <div role="alert" className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Publish the widget first. Installation code is generated from the stable public widget ID.</div> :
      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-semibold">HTML / custom website</h2><p className="mt-1 text-sm text-slate-600">Paste this code where the widget should appear.</p><pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-white"><code>{embedCode}</code></pre><button onClick={() => copy(embedCode, "html")} className="mt-3 rounded-lg bg-slate-950 px-4 py-2 text-sm text-white">{copied === "html" ? "Copied" : "Copy code"}</button></section>
        <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-semibold">Direct share URL</h2><p className="mt-1 text-sm text-slate-600">Use this URL to preview or share the published widget.</p><div className="mt-4 flex gap-2"><input readOnly value={`${window.location.origin}/embed/${publicKey}`} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button onClick={() => copy(`${window.location.origin}/embed/${publicKey}`, "url")} className="rounded-lg border px-4 py-2 text-sm">{copied === "url" ? "Copied" : "Copy"}</button></div></section>
        <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-semibold">Supported installation</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600"><li>HTML and static websites: paste the script above.</li><li>WordPress and other CMS platforms: use an HTML/custom-code block.</li><li>Website builders: use their custom HTML/embed element.</li></ul></section>
      </div>}
  </main>;
}