import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";

export default async function Home() {
  const session = await getSessionFromCookies();

  if (!session) redirect("/login");

  if (session.role === "ADMIN") redirect("/admin");
  if (session.role === "AFFILIATE") redirect("/affiliate");
  if (session.role === "PARTNER") redirect("/partner");

  redirect("/login");
}
