"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/firebase/auth-client";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function LogoutButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAdmin();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-nav-link w-full hover:bg-[var(--ui-danger-soft)] hover:text-ui-danger"
      >
        <LogOut size={18} />
        Logout
      </button>

      <ConfirmDialog
        open={open}
        title="Log out"
        message="Are you sure you want to log out of the admin panel?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        variant="danger"
        loading={loggingOut}
        onClose={() => setOpen(false)}
        onConfirm={() => void handleLogout()}
      />
    </>
  );
}
