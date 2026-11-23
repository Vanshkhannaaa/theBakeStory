"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { CategoryFormDialog, ActiveToggle, type CategoryRow } from "@/components/CategoryFormDialog";
import { reorderCategories, restoreCategory, softDeleteCategory, updateCategory, MAX_TOP_CATEGORIES } from "@/lib/firebase/db";
import { AdminDialog } from "@/components/AdminDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface CategoriesManagerProps {
  categories: CategoryRow[];
  deletedCategories: CategoryRow[];
}

export function CategoriesManager({ categories: initial, deletedCategories: initialDeleted }: CategoriesManagerProps) {
  const [items, setItems] = useState(initial);
  const [deletedItems] = useState(initialDeleted);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [binOpen, setBinOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState("");

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const persistOrder = useCallback(
    async (ordered: CategoryRow[]) => {
      await reorderCategories(ordered.map((c, index) => ({ id: c.id, order: index })));
    },
    [],
  );

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((c) => c.id === dragId);
    const to = items.findIndex((c) => c.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null);
    void persistOrder(next);
  };

  const featuredCount = items.filter((c) => c.topCategory).length;

  const toggleActive = async (category: CategoryRow) => {
    setBusyId(category.id);
    await updateCategory(category.id, { active: !category.active });
    setItems((prev) => prev.map((c) => (c.id === category.id ? { ...c, active: !c.active } : c)));
    setBusyId(null);
  };

  const toggleTopCategory = async (category: CategoryRow) => {
    const next = !category.topCategory;
    if (next && featuredCount >= MAX_TOP_CATEGORIES) {
      setBannerError(`You can feature at most ${MAX_TOP_CATEGORIES} categories in Shop by Occasion`);
      return;
    }
    setBusyId(category.id);
    setBannerError("");
    try {
      await updateCategory(category.id, { topCategory: next });
      setItems((prev) => prev.map((c) => (c.id === category.id ? { ...c, topCategory: next } : c)));
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : "Failed to update Shop by Occasion");
    }
    setBusyId(null);
  };

  const softDelete = async (category: CategoryRow) => {
    setBusyId(category.id);
    await softDeleteCategory(category.id);
    setItems((prev) => prev.filter((c) => c.id !== category.id));
    setBusyId(null);
    setDeleteTarget(null);
  };

  const restore = async (category: CategoryRow) => {
    setBusyId(category.id);
    await restoreCategory(category.id);
    window.location.reload();
    setBusyId(null);
  };

  const formatCreated = (date?: Date) => {
    if (!date) return "—";
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
  };

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <header className="admin-page-header mb-0">
          <p className="admin-subtitle">
            {items.length} categories · drag rows to reorder · Shop by Occasion {featuredCount}/{MAX_TOP_CATEGORIES}
          </p>
        </header>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => setBinOpen(true)} className="admin-btn-secondary">
            <Trash2 size={16} /> Bin
            {deletedItems.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                {deletedItems.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="admin-btn-primary"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {bannerError && <p className="admin-error mt-4">{bannerError}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10" />
              <th>Name</th>
              <th>Created on</th>
              <th>Active</th>
              <th>Occasion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                draggable
                onDragStart={() => setDragId(c.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(c.id)}
                className={dragId === c.id ? "opacity-50" : ""}
              >
                <td className="text-ui-faint">
                  <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                </td>
                <td className="font-medium">{c.name}</td>
                <td className="text-sm text-ui-muted">{formatCreated(c.createDate)}</td>
                <td>
                  <ActiveToggle
                    checked={c.active}
                    onChange={() => toggleActive(c)}
                    label={`Toggle ${c.name}`}
                  />
                </td>
                <td>
                  <ActiveToggle
                    checked={c.topCategory}
                    onChange={() => toggleTopCategory(c)}
                    label={`Shop by Occasion ${c.name}`}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => {
                        setEditing(c);
                        setDialogOpen(true);
                      }}
                      className="admin-btn-text"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => setDeleteTarget(c)}
                      className="admin-btn-text"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="admin-empty border-0">No categories yet. Click &quot;Add Category&quot; to create one.</p>
        )}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        category={editing}
        featuredCount={featuredCount}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category"
        message={
          deleteTarget
            ? `Move "${deleteTarget.name}" to bin? You can restore it later from the Bin.`
            : ""
        }
        confirmLabel="Move to bin"
        cancelLabel="Cancel"
        variant="danger"
        loading={Boolean(deleteTarget && busyId === deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void softDelete(deleteTarget)}
      />

      <AdminDialog open={binOpen} title="Bin" onClose={() => setBinOpen(false)}>
        <div className="px-6 py-5">
          {deletedItems.length === 0 ? (
            <p className="text-sm text-ui-muted">No deleted categories.</p>
          ) : (
            <ul className="space-y-3">
              {deletedItems.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-ui-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-ui-text">{c.name}</p>
                    <p className="text-xs text-ui-muted">{formatCreated(c.createDate)}</p>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => restore(c)}
                    className="admin-btn-ghost text-sm"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminDialog>
    </div>
  );
}
