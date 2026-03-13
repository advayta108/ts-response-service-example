import { cookies } from "next/headers";

const COOKIE = "session_user_id";

export async function getSessionUserId(): Promise<number | null> {
  const c = await cookies();
  const v = c.get(COOKIE)?.value;
  if (!v) return null;
  const id = parseInt(v, 10);
  return Number.isFinite(id) ? id : null;
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    maxAge,
  };
}

export { COOKIE as SESSION_COOKIE_NAME };
