"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/firebase/auth-client";
import { getAdminPageMeta } from "@/lib/admin-page-meta";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  name: string;
  email: string;
}

export function AdminHeader({ name, email }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pageMeta = getAdminPageMeta(pathname);
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = name.charAt(0).toUpperCase() || "A";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAdmin();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="admin-header-bar">
        <div className="admin-header-leading">
          {pageMeta?.backHref && (
            <Link href={pageMeta.backHref} className="admin-header-back" aria-label="Go back">
              <ChevronLeft size={22} strokeWidth={2.25} />
            </Link>
          )}
          {pageMeta?.title && <h1 className="admin-header-title">{pageMeta.title}</h1>}
        </div>

        <div className="admin-header-actions">
          <ThemeToggle variant="chip" />
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="admin-chip min-h-[44px] gap-2 px-3 py-2 transition-colors hover:bg-[var(--ui-surface-hover)]"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {initial}
              </span>
              <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
              <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ui-border bg-[var(--ui-surface)] shadow-lg"
              >
                <div className="border-b border-ui-border px-4 py-3">
                  <p className="truncate text-sm font-medium text-ui-text">{name}</p>
                  <p className="truncate text-xs text-ui-muted">{email}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-ui-danger transition-colors hover:bg-[var(--ui-danger-soft)]"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={logoutOpen}
        title="Log out"
        message="Are you sure you want to log out of the admin panel?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        variant="danger"
        loading={loggingOut}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => void handleLogout()}
      />
    </>
  );
}
