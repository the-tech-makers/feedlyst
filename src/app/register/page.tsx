import Link from "next/link";
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        accountName: form.get("accountName"),
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Registration failed");
      return;
    }
    router.push("/login");
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.9fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#13264a] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -left-28 top-28 size-[28rem] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 size-[26rem] rounded-full bg-violet-500/20 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-white text-lg font-bold text-[#3867f4]">f</span><span className="text-xl font-bold tracking-tight">feedlyst<span className="text-blue-300">.</span></span></Link>
        <div className="relative max-w-xl pb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Your workspace starts here</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Make trust part of your website.</h1>
          <p className="mt-5 max-w-md leading-7 text-blue-100/75">Create a workspace for your team. Then connect sources, curate customer stories, and build widgets at your own pace.</p>
          <div className="mt-10 space-y-4">
            {[["01","One home for your projects"],["02","A clear path from review to widget"],["03","You choose what gets published"]].map(([n,label]) => <div key={n} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><span className="grid size-9 place-items-center rounded-xl bg-white/10 text-xs font-bold text-blue-200">{n}</span><p className="text-sm font-semibold text-white/90">{label}</p></div>)}
          </div>
        </div>
        <p className="relative text-xs text-blue-100/50">A calmer way to manage social proof.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900 lg:hidden"><span className="grid size-8 place-items-center rounded-xl bg-[#3867f4] text-white">f</span> feedlyst.</Link>
          <div className="mb-7">
            <p className="text-sm font-semibold text-[#3867f4]">Get started for free</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#10233f]">Create your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Set up your Feedlyst account. Your workspace and starter project will be created for you.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div><label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Your name <span className="font-normal text-slate-400">(optional)</span></label><input id="name" name="name" autoComplete="name" placeholder="Alex Morgan" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            <div><label htmlFor="accountName" className="mb-2 block text-sm font-semibold text-slate-700">Workspace name</label><input id="accountName" name="accountName" required autoComplete="organization" placeholder="Your company or project" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Work email</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Create a password</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /><p className="mt-1.5 text-xs text-slate-400">Use at least 8 characters.</p></div>
            {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3867f4] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">Create account <span aria-hidden="true">→</span></button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <a href="/login" className="font-bold text-[#3867f4] hover:text-blue-800">Sign in</a></p>
          <p className="mt-7 text-center text-xs leading-5 text-slate-400">By creating an account, you agree to keep your workspace and content secure.</p>
        </div>
      </section>
    </main>
  );
}
