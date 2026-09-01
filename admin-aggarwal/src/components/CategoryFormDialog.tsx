"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminDialog } from "@/components/AdminDialog";
import type { Category } from "@/lib/firebase/types";
import { createCategory, updateCategory } from "@/lib/firebase/db";

export type CategoryRow = Category;

interface CategoryFormDialogProps {
  open: boolean;
  category?: CategoryRow | null;
  onClose: () => void;
}

function ActiveToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Active"}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-ui-border"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

export function CategoryFormDialog({ open, category, onClose }: CategoryFormDialogProps) {
  const isEdit = Boolean(category);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (category) {
      setName(category.name);
      setSubtitle(category.subtitle ?? category.description ?? "");
      setActive(category.active);
    } else {
      setName("");
      setSubtitle("");
      setActive(true);
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEdit) {
        await updateCategory(category!.id, { name, subtitle: subtitle.trim(), active });
      } else {
        await createCategory({ name, subtitle: subtitle.trim() });
      }
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
    setSaving(false);
  };

  return (
    <AdminDialog open={open} title={isEdit ? "Edit category" : "New category"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        <div>
          <label className="admin-label" htmlFor="cat-name">
            Name
          </label>
          <input
            id="cat-name"
            className="admin-input"
            placeholder="e.g. Anniversary Cakes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="admin-label" htmlFor="cat-subtitle">
            Subtitle
          </label>
          <textarea
            id="cat-subtitle"
            className="admin-input min-h-[5.5rem] resize-y"
            placeholder="Short line shown under the category name on the website"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            maxLength={300}
            rows={3}
          />
          <p className="mt-1.5 text-xs text-ui-muted">{subtitle.length}/300</p>
        </div>

        {isEdit && (
          <div className="flex items-center justify-between gap-4">
            <span className="admin-label mb-0">Active</span>
            <ActiveToggle checked={active} onChange={setActive} label="Category active" />
          </div>
        )}

        {error && <p className="admin-error">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-ui-border pt-5">
          <button type="button" onClick={onClose} className="admin-btn-ghost" disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving || !name.trim()} className="admin-btn-primary min-w-[7rem]">
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export { ActiveToggle };
