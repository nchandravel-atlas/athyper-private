import { cookies } from "next/headers";

import type { Session, WorkbenchType } from "./types";

const COOKIE_NAME = "neon_session";

export function setSession(session: Session) {
  cookies().set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true behind HTTPS
    path: "/"
  });
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

export function getSession(): Session | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function getWorkbenchFromSession(): WorkbenchType | null {
  return getSession()?.workbench ?? null;
}
