"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ImageUploadField } from "@/components/ImageUploadField";
import type { Video } from "@/lib/firebase/types";
import { createVideoWithId, updateVideo } from "@/lib/firebase/db";
import { assertVideoUploadMeta, resolveVideoObjectPath, uploadVideoFile } from "@/lib/firebase/client-storage";

interface VideoFormProps {
  video?: Video;
}

export function VideoForm({ video }: VideoFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: video?.title ?? "",
    posterUrl: video?.posterUrl ?? "",
    active: video?.active ?? true,
    isAboutUsVideo: video?.isAboutUsVideo ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!video) {
        if (!file) {
          setError("Please choose a video file to upload");
          setSaving(false);
          return;
        }
        const contentType = file.type || "video/mp4";
        assertVideoUploadMeta(contentType, file.size);
        const videoId = crypto.randomUUID();
        const path = resolveVideoObjectPath(videoId, file.name, contentType);
        await createVideoWithId(videoId, {
          title: form.title || null,
          posterUrl: form.posterUrl || null,
          active: form.active,
          isAboutUsVideo: form.isAboutUsVideo,
          originalPath: path,
        });
        await uploadVideoFile(file, videoId);
        await updateVideo(videoId, { status: "processing", error: null });
      } else if (file) {
        const contentType = file.type || "video/mp4";
        assertVideoUploadMeta(contentType, file.size);
        const path = resolveVideoObjectPath(video.id, file.name, contentType);
        await updateVideo(video.id, {
          title: form.title || null,
          posterUrl: form.posterUrl || null,
          active: form.active,
          isAboutUsVideo: form.isAboutUsVideo,
          originalPath: path,
          status: "processing",
          error: null,
          url: null,
          optimizedPath: null,
        });
        await uploadVideoFile(file, video.id);
      } else {
        await updateVideo(video.id, {
          title: form.title || null,
          posterUrl: form.posterUrl || null,
          active: form.active,
          isAboutUsVideo: form.isAboutUsVideo,
        });
      }

      router.push("/videos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card mt-6 max-w-2xl space-y-5">
      <div>
        <label className="admin-label">
          {video ? "Replace video file (optional)" : "Video file *"}
        </label>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          className="admin-input"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="mt-1.5 text-xs text-ui-muted">
          Max 50MB. Uploads with your signed-in admin account. Cloud Function then compresses it for the site.
        </p>
        {file ? (
          <p className="mt-1 text-xs text-ui-muted">
            Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
          </p>
        ) : null}
        {video?.status === "processing" ? (
          <p className="mt-2 text-sm text-amber-700">Optimizing in progress…</p>
        ) : null}
        {video?.status === "ready" && video.url ? (
          <p className="mt-2 text-xs text-ui-muted">Optimized file ready.</p>
        ) : null}
        {video?.status === "failed" ? (
          <p className="mt-2 text-sm text-red-600">
            Optimization failed{video.error ? `: ${video.error}` : ""}. Upload a new file to retry.
          </p>
        ) : null}
      </div>

      <div>
        <label className="admin-label">Title</label>
        <input
          className="admin-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Diwali special reel"
        />
      </div>

      <ImageUploadField
        label="Poster image (optional)"
        value={form.posterUrl}
        onChange={(posterUrl) => setForm({ ...form, posterUrl })}
        folder="restro/videos/posters"
        hint="Still frame shown before playback."
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Active (visible in homepage Video Gallery when ready)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isAboutUsVideo}
          onChange={(e) => setForm({ ...form, isAboutUsVideo: e.target.checked })}
        />
        Use as About Us video
      </label>

      {error && <p className="admin-error">{error}</p>}
      <button type="submit" disabled={saving || (!video && !file)} className="admin-btn-primary-lg">
        {saving ? (
          <>
            <Loader2 className="animate-spin" size={16} /> Uploading…
          </>
        ) : video ? (
          "Save Video"
        ) : (
          "Upload Video"
        )}
      </button>
    </form>
  );
}
