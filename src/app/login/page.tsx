import Link from "next/link";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-[#13264a] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 top-20 size-[28rem] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 size-[26rem] rounded-full bg-violet-500/20 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-white text-lg font-bold text-[#3867f4]">f</span><span className="text-xl font-bold tracking-tight">feedlyst<span className="text-blue-300">.</span></span></Link>
        <div className="relative max-w-xl pb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Welcome back</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Your best customer stories are waiting.</h1>
          <p className="mt-5 max-w-md leading-7 text-blue-100/75">Sign in to organize reviews, manage your widgets, and keep your website’s social proof up to date.</p>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
            <div className="flex items-center gap-1 text-amber-300">★★★★★</div>
            <p className="mt-3 text-sm leading-6 text-white/90">“When customer stories are easy to manage, it becomes much easier to share the trust you’ve earned.”</p>
            <p className="mt-4 text-xs font-semibold text-blue-200">The Feedlyst workflow</p>
          </div>
        </div>
        <p className="relative text-xs text-blue-100/50">Bring your reviews together. Share what matters.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900 lg:hidden"><span className="grid size-8 place-items-center rounded-xl bg-[#3867f4] text-white">f</span> feedlyst.</Link>
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#3867f4]">Account access</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#10233f]">Sign in to Feedlyst</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Welcome back. Enter your account details to continue to your workspace.</p>
          </div>
          <form
            action={async (formData) => {
              "use server";
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/dashboard",
              });
            }}
            className="space-y-5"
          >
            <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label></div><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3867f4] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">Sign in <span aria-hidden="true">→</span></button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">New to Feedlyst? <a href="/register" className="font-bold text-[#3867f4] hover:text-blue-800">Create an account</a></p>
          <p className="mt-12 text-center text-xs text-slate-400">By continuing, you agree to use Feedlyst responsibly.</p>
        </div>
      </section>
    </main>
  );
}
