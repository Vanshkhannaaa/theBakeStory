import { cookies } from "next/headers";
import { adminAuth } from "./admin";
import { getAdminProfile } from "./db";
import { SESSION_COOKIE_NAME } from "./constants";
import { NextResponse } from "next/server";

export async function getServerSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const profile = await getAdminProfile(decoded.uid);
    if (!profile || !profile.active) return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? profile.email,
      name: profile.name,
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getServerSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function createSessionCookie(idToken: string): Promise<string> {
  const { SESSION_COOKIE_MAX_AGE } = await import("./constants");
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_MAX_AGE * 1000 });
}

export async function verifyIdToken(idToken: string) {
  return adminAuth.verifyIdToken(idToken);
}
