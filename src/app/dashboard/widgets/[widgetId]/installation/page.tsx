import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import InstallationClient from "./installation-client";

export default async function WidgetInstallationPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { widgetId } = await params;
  const widget = await db.widget.findFirst({
    where: { id: widgetId, type: "review", project: { account: { memberships: { some: { userId: session.user.id } } } } },
    select: { id: true, name: true, publication: { select: { publicKey: true, status: true, allowedDomains: true } } },
  });
  if (!widget) redirect("/dashboard");
  return <InstallationClient widget={widget} />;
}