import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import db from "@/lib/db";
import DashboardShell from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { avatarUrl: true },
  });

  return (
    <DashboardShell session={session} avatarUrl={user?.avatarUrl}>
      {children}
    </DashboardShell>
  );
}
