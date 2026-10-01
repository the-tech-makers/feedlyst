import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await db.project.findMany({
    where: { account: { memberships: { some: { userId: session.user.id } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true, websiteUrl: true, status: true },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Your Feedlyst projects.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-xl border p-5">
            <h2 className="font-medium">{project.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{project.websiteUrl ?? project.slug}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">{project.status}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
