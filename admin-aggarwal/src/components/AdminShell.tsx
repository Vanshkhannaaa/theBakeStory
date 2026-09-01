"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { useAuth } from "@/components/AuthProvider";

const PUBLIC_PATHS = ["/login"];

export function AdminShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (auth.status === "loading") return;
    if (!isPublic && auth.status === "signedOut") {
      const next = pathname === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(next);
    }
    if (isPublic && auth.status === "signedIn") {
      router.replace("/banners");
    }
  }, [auth.status, isPublic, pathname, router]);

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ui-muted">
        Loading…
      </div>
    );
  }

  if (auth.status !== "signedIn") {
    if (isPublic) return <div className="flex-1">{children}</div>;
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ui-muted">
        Redirecting…
      </div>
    );
  }

  if (isPublic) {
    return <div className="flex-1">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="admin-shell flex-1 lg:ml-[15.5rem]">
        <div className="admin-accent-glow" aria-hidden />
        <div className="admin-main">
          <AdminHeader name={auth.profile.name} email={auth.profile.email} />
          {children}
        </div>
      </div>
    </div>
  );
}
