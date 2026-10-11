"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateWidgetForm({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [name, setName] = useState("Customer reviews");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/widgets`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; widget?: { id: string } };
      if (!response.ok || !body.widget?.id) {
        setError(body.error ?? "Couldn't create the widget. Please try again.");
        return;
      }
      router.push(`/dashboard/widgets/${body.widget.id}`);
      router.refresh();
    } catch {
      setError("Couldn't create the widget. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="mt-8 grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:grid-cols-[1fr_1.5fr_auto] sm:items-end sm:p-6"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">New widget name</span><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} placeholder="Customer reviews" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label><button type="submit" disabled={busy || !projectId || !name.trim()} className="rounded-xl bg-[#3867f4] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{busy ? "Creating…" : "＋ Create widget"}</button>{error ? <p role="alert" className="text-sm text-red-600 sm:col-span-3">{error}</p> : null}</form>;
}
