import { NextRequest } from "next/server";
import { clearSessionCookie, getSessionFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import { apiSuccess } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);

  if (session) {
    // Invalidate all sessions for this user (or just the current token)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("ws_session")?.value;

    if (token) {
      await db.session.deleteMany({ where: { token } }).catch(() => null);
    }
  }

  await clearSessionCookie();
  return apiSuccess({ message: "Logged out" });
}
