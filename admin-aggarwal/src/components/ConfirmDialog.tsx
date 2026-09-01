"use client";

import { AdminDialog } from "@/components/AdminDialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AdminDialog open={open} title={title} onClose={loading ? () => {} : onClose}>
      <div className="px-6 py-5">
        <p className="text-sm text-ui-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="admin-btn-secondary">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(variant === "danger" ? "admin-btn-danger" : "admin-btn-primary")}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </AdminDialog>
  );
}
