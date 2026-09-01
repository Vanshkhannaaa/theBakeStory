"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { ActiveToggle } from "@/components/CategoryFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Video } from "@/lib/firebase/types";
import { deleteVideo, getVideos, reorderVideos, updateVideo } from "@/lib/firebase/db";

interface VideosManagerProps {
  videos: Video[];
}

function formatCreated(date?: Date | string) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

function StatusBadge({ status }: { status: Video["status"] }) {
  const styles =
    status === "ready"
      ? "bg-emerald-100 text-emerald-800"
      : status === "failed"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  const label = status === "ready" ? "Ready" : status === "failed" ? "Failed" : "Optimizing…";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}

export function VideosManager({ videos: initial }: VideosManagerProps) {
  const [items, setItems] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  // Light JSON poll while optimizing — avoid full RSC refresh (that re-hangs the page).
  const hasProcessing = items.some((v) => v.status === "processing");
  useEffect(() => {
    if (!hasProcessing) return;

    const tick = async () => {
      try {
        setItems(await getVideos());
      } catch {
        // ignore transient poll errors
      }
    };

    const timer = window.setInterval(() => void tick(), 5000);
    return () => window.clearInterval(timer);
  }, [hasProcessing]);

  const persistOrder = useCallback(async (ordered: Video[]) => {
    await reorderVideos(ordered.map((video, index) => ({ id: video.id, order: index })));
  }, []);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex((video) => video.id === dragId);
    const to = items.findIndex((video) => video.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null);
    void persistOrder(next);
  };

  const toggleActive = async (video: Video) => {
    setBusyId(video.id);
    const updated = await updateVideo(video.id, { active: !video.active });
    if (updated) {
      setItems((prev) =>
        prev.map((item) => (item.id === video.id ? { ...item, active: updated.active } : item)),
      );
    }
    setBusyId(null);
  };

  const toggleAbout = async (video: Video) => {
    setBusyId(video.id);
    const nextValue = !video.isAboutUsVideo;
    await updateVideo(video.id, { isAboutUsVideo: nextValue });
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isAboutUsVideo: item.id === video.id ? nextValue : nextValue ? false : item.isAboutUsVideo,
      })),
    );
    setBusyId(null);
  };

  const remove = async (video: Video) => {
    setBusyId(video.id);
    await deleteVideo(video.id);
    setItems((prev) => prev.filter((item) => item.id !== video.id));
    setDeleteTarget(null);
    setBusyId(null);
  };

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="admin-subtitle">
          {items.length} videos · drag to reorder · status updates automatically while optimizing
        </p>
        <Link href="/videos/new" className="admin-btn-primary">
          <Plus size={16} /> Add Video
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10" />
              <th>Title</th>
              <th>Status</th>
              <th>About Us</th>
              <th>Created</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((video) => (
              <tr
                key={video.id}
                draggable
                onDragStart={() => setDragId(video.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(video.id)}
                className={dragId === video.id ? "opacity-50" : ""}
              >
                <td className="text-ui-faint">
                  <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                </td>
                <td className="font-medium">{video.title?.trim() || "Untitled video"}</td>
                <td>
                  <StatusBadge status={video.status} />
                  {video.status === "failed" && video.error ? (
                    <p className="mt-1 max-w-xs truncate text-xs text-red-600">{video.error}</p>
                  ) : null}
                </td>
                <td>
                  <button
                    type="button"
                    disabled={busyId === video.id}
                    onClick={() => void toggleAbout(video)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      video.isAboutUsVideo
                        ? "bg-primary/15 text-primary"
                        : "bg-ui-surface-muted text-ui-muted"
                    }`}
                  >
                    {video.isAboutUsVideo ? "Yes" : "No"}
                  </button>
                </td>
                <td className="text-sm text-ui-muted">{formatCreated(video.createDate)}</td>
                <td>
                  <ActiveToggle
                    checked={video.active}
                    onChange={() => void toggleActive(video)}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/videos/edit?id=${video.id}`}
                      className="admin-btn-secondary !px-2.5 !py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === video.id}
                      onClick={() => setDeleteTarget(video)}
                      className="admin-btn-secondary !px-2.5 !py-1.5 text-xs text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-ui-muted">
                  No videos yet. Upload one to show in the homepage Video Gallery.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete video?"
        message="This permanently removes the video and its storage files."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && void remove(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
