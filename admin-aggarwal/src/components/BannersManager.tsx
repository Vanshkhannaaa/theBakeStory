"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { Eye, GripVertical, Plus, Trash2 } from "lucide-react";
import { ActiveToggle } from "@/components/CategoryFormDialog";
import { AdminDialog } from "@/components/AdminDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { BannerImage } from "@/lib/firebase/types";
import { reorderBanners, restoreBanner, softDeleteBanner, updateBanner } from "@/lib/firebase/db";

interface BannersManagerProps {
  banners: BannerImage[];
  deletedBanners: BannerImage[];
}

function BannerTitlePreview({ banner }: { banner: BannerImage }) {
  const title = banner.title?.trim() || "Untitled banner";
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const previewWidth = 320;
    const previewHeight = 180;
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < previewHeight + gap && rect.top > previewHeight + gap;
    const top = placeAbove ? rect.top - previewHeight - gap : rect.bottom + gap;
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - previewWidth - 12);

    setPosition({ top, left });
  }, []);

  const showPreview = () => {
    updatePosition();
    setOpen(true);
  };

  const preview = open && mounted ? (
    <div
      className="pointer-events-none fixed z-[100] w-80"
      style={{ top: position.top, left: position.left }}
    >
      <div className="overflow-hidden rounded-lg border border-ui-border bg-ui-surface shadow-xl">
        {banner.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.imageUrl} alt={title} className="aspect-[21/9] w-full object-cover" />
        ) : (
          <div className="flex aspect-[21/9] items-center justify-center bg-ui-surface-muted text-xs text-ui-muted">
            No image
          </div>
        )}
        <p className="border-t border-ui-border px-3 py-2 text-xs text-ui-muted">{title}</p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        ref={anchorRef}
        className="inline-flex max-w-full cursor-default items-center gap-2"
        onMouseEnter={showPreview}
        onMouseLeave={() => setOpen(false)}
        onFocus={showPreview}
        onBlur={() => setOpen(false)}
      >
        <Eye size={16} className="shrink-0 text-ui-muted" aria-hidden />
        <span className="truncate font-medium">{title}</span>
      </div>
      {mounted && preview ? createPortal(preview, document.body) : null}
    </>
  );
}

function formatCreated(date?: Date | string) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function BannersManager({ banners: initial, deletedBanners: initialDeleted }: BannersManagerProps) {
  const [items, setItems] = useState(initial);
  const [deletedItems] = useState(initialDeleted);
  const [dragId, setDragId] = useState<string | null>(null);
  const [binOpen, setBinOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BannerImage | null>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const persistOrder = useCallback(
    async (ordered: BannerImage[]) => {
      await reorderBanners(ordered.map((banner, index) => ({ id: banner.id, order: index })));
    },
    [],
  );

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((banner) => banner.id === dragId);
    const to = items.findIndex((banner) => banner.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null);
    void persistOrder(next);
  };

  const toggleActive = async (banner: BannerImage) => {
    setBusyId(banner.id);
    const updated = await updateBanner(banner.id, { active: !banner.active });
    if (updated) {
      setItems((prev) =>
        prev.map((item) => (item.id === banner.id ? { ...item, active: updated.active } : item)),
      );
    }
    setBusyId(null);
  };

  const softDelete = async (banner: BannerImage) => {
    setBusyId(banner.id);
    await softDeleteBanner(banner.id);
    setItems((prev) => prev.filter((item) => item.id !== banner.id));
    setDeleteTarget(null);
    setBusyId(null);
  };

  const restore = async (banner: BannerImage) => {
    setBusyId(banner.id);
    await restoreBanner(banner.id);
    window.location.reload();
    setBusyId(null);
  };

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="admin-subtitle">{items.length} banners · drag rows to reorder</p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => setBinOpen(true)} className="admin-btn-secondary">
            <Trash2 size={16} /> Bin
            {deletedItems.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                {deletedItems.length}
              </span>
            )}
          </button>
          <Link href="/banners/new" className="admin-btn-primary">
            <Plus size={16} /> Add Banner
          </Link>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10" />
              <th>Title</th>
              <th>Created on</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((banner) => (
              <tr
                key={banner.id}
                draggable
                onDragStart={() => setDragId(banner.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(banner.id)}
                className={dragId === banner.id ? "opacity-50" : ""}
              >
                <td className="text-ui-faint">
                  <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                </td>
                <td>
                  <BannerTitlePreview banner={banner} />
                </td>
                <td className="text-sm text-ui-muted">{formatCreated(banner.createDate)}</td>
                <td>
                  <ActiveToggle
                    checked={banner.active}
                    onChange={() => toggleActive(banner)}
                    label={`Active ${banner.title ?? "banner"}`}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/banners/edit?id=${banner.id}`}
                      className={`admin-btn-text ${busyId === banner.id ? "pointer-events-none opacity-50" : ""}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === banner.id}
                      onClick={() => setDeleteTarget(banner)}
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
          <p className="admin-empty">No banners yet. Add your first homepage slide.</p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete banner"
        message={
          deleteTarget
            ? `Move "${deleteTarget.title?.trim() || "Untitled banner"}" to bin? You can restore it later from the Bin.`
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
            <p className="text-sm text-ui-muted">No deleted banners.</p>
          ) : (
            <ul className="space-y-3">
              {deletedItems.map((banner) => (
                <li
                  key={banner.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-ui-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ui-text">
                      {banner.title?.trim() || "Untitled banner"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === banner.id}
                    onClick={() => restore(banner)}
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
