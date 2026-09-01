"use client";

import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getClientAuth, getClientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/constants";
import type { AdminProfile } from "@/lib/firebase/types";

const NOT_AUTHORIZED = "You are not authorized to access this admin panel.";

async function requireAdminProfile(user: User): Promise<AdminProfile> {
  const snap = await getDoc(doc(getClientDb(), COLLECTIONS.admins, user.uid));
  if (!snap.exists()) throw new Error(NOT_AUTHORIZED);
  const d = snap.data();
  if (d.active === false) throw new Error("This admin account is inactive.");
  return {
    uid: snap.id,
    email: d.email,
    name: d.name ?? d.displayName ?? "Admin",
    role: d.role,
    active: d.active !== false,
    createDate: d.createDate?.toDate?.(),
    updatedAt: d.updatedAt?.toDate?.(),
  };
}

export async function loginAdmin(email: string, password: string): Promise<User> {
  const auth = getClientAuth();
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  try {
    await requireAdminProfile(credential.user);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  return credential.user;
}

export async function createServerSession(idToken: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Failed to create session");
  }
}

export async function logoutAdmin() {
  await fetch("/api/auth/session", { method: "DELETE" });
  await signOut(getClientAuth());
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getClientAuth(), callback);
}
