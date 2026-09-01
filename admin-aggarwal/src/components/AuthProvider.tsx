"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadAdminProfile, subscribeToAuth } from "@/lib/firebase/auth-client";
import type { AdminProfile } from "@/lib/firebase/types";

type AuthState =
  | { status: "loading"; profile: null }
  | { status: "signedOut"; profile: null }
  | { status: "signedIn"; profile: AdminProfile };

const AuthContext = createContext<AuthState>({ status: "loading", profile: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", profile: null });

  useEffect(() => {
    return subscribeToAuth(async (user) => {
      if (!user) {
        setState({ status: "signedOut", profile: null });
        return;
      }
      try {
        const profile = await loadAdminProfile(user);
        setState({ status: "signedIn", profile });
      } catch {
        setState({ status: "signedOut", profile: null });
      }
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
