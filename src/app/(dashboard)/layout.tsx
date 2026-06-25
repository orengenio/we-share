import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
