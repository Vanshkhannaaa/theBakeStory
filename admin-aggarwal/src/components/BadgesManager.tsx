"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { MenuBadge } from "@/lib/firebase/types";
import { saveBadgesData } from "@/lib/firebase/db";
import { BadgePreview } from "@/components/BadgePreview";

interface BadgesManagerProps {
  badges: MenuBadge[];
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

function newBadge(order: number): MenuBadge {
  return {
    id: crypto.randomUUID(),
    name: "",
    color: "#047857",
    active: true,
    order,
  };
}

export function BadgesManager({ badges: initial }: BadgesManagerProps) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateBadge = (id: string, patch: Partial<MenuBadge>) => {
    setItems((prev) => prev.map((badge) => (badge.id === id ? { ...badge, ...patch } : badge)));
    setSuccess(false);
  };

  const removeBadge = (id: string) => {
    setItems((prev) => prev.filter((badge) => badge.id !== id));
    setSuccess(false);
  };

  const addBadge = () => {
    setItems((prev) => [...prev, newBadge(prev.length)]);
    setSuccess(false);
  };

  const handleSave = async () => {
    const trimmed = items.map((badge) => ({ ...badge, name: badge.name.trim() }));
    if (trimmed.some((badge) => !badge.name)) {
      setError("Every badge needs a name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const badges = await saveBadgesData(trimmed);
      setItems(badges);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save badges");
    }
    setSaving(false);
  };

  return (
    <div className="admin-page">
      <p className="admin-subtitle">
        Configure badges that appear when creating or editing menu items.
      </p>

      <div className="admin-card mt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((badge) => (
            <div key={badge.id} className="rounded-xl border border-ui-border p-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label={`Color for ${badge.name || "badge"}`}
                  value={badge.color}
                  onChange={(e) => updateBadge(badge.id, { color: e.target.value })}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-full border border-ui-border bg-transparent p-0.5"
                />
                <input
                  className="admin-input"
                  placeholder="Badge name"
                  value={badge.name}
                  onChange={(e) => updateBadge(badge.id, { name: e.target.value })}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-ui-border pt-4">
                <BadgePreview badge={badge} />
                <div className="flex items-center gap-3">
                  <ActiveToggle
                    checked={badge.active}
                    onChange={(active) => updateBadge(badge.id, { active })}
                    label={`Toggle ${badge.name || "badge"}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeBadge(badge.id)}
                    className="admin-btn-text text-ui-muted hover:text-ui-danger"
                    aria-label={`Delete ${badge.name || "badge"}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addBadge} className="admin-btn-secondary mt-4">
          <Plus size={16} /> Add badge
        </button>

        {error && <p className="admin-error mt-4">{error}</p>}
        {success && <p className="admin-success mt-4">Badges saved.</p>}

        <div className="mt-6 flex justify-end border-t border-ui-border pt-5">
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="admin-btn-primary">
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving…
              </>
            ) : (
              "Save badges"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
