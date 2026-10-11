import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reviews = await db.review.findMany({
    where: { source: { connection: { account: { memberships: { some: { userId: session.user.id } } } } } },
    include: { source: { select: { name: true, connection: { select: { integration: { select: { name: true } } } } } } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return <main className="min-h-screen bg-[#f6f8fc] text-[#10233f]"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10"><Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link><div className="mt-6"><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#3867f4]">Workspace / Reviews</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Review library</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Browse customer feedback from your connected sources. These reviews can be selected for your website widgets.</p></div><div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div><p className="text-sm font-semibold text-slate-500">Reviews collected</p><p className="mt-2 text-3xl font-bold">{reviews.length}</p></div><Link href="/dashboard/sources" className="rounded-xl bg-[#3867f4] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Manage sources →</Link></div>{reviews.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-2xl text-amber-700">✳</span><h2 className="mt-5 text-lg font-bold">Your review library is empty</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Connect Google Business Profile and sync your locations to bring customer reviews into this space.</p><Link href="/dashboard/sources" className="mt-6 inline-flex rounded-xl bg-[#3867f4] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Connect a source →</Link></div> : <div className="mt-6 space-y-3">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="font-bold">{review.authorName}</p><p className="mt-1 text-xs text-slate-400">{review.source.name} · {review.source.connection.integration.name}{review.publishedAt ? ` · ${review.publishedAt.toLocaleDateString()}` : ""}</p></div><span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">{"★".repeat(Math.max(0, Math.min(5, review.rating)))}<span className="ml-1 text-xs">{review.rating}/5</span></span></div>{review.title ? <h2 className="mt-4 font-semibold">{review.title}</h2> : null}{review.body ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.body}</p> : <p className="mt-3 text-sm italic text-slate-400">No written comment on this review.</p>}</article>)}</div>}</div></main>;
}
