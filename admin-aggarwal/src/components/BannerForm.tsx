"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BannerImage } from "@/lib/firebase/types";
import { createBanner, updateBanner } from "@/lib/firebase/db";
import {
  BANNER_ASPECT_RATIO,
  BANNER_IMAGE_HEIGHT,
  BANNER_IMAGE_WIDTH,
  BANNER_RECOMMENDED_SIZE,
} from "@/lib/firebase/constants";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Loader2 } from "lucide-react";

interface BannerFormProps {
  banner?: BannerImage;
}

export function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    imageUrl: banner?.imageUrl ?? "",
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    redirectUrl: banner?.redirectUrl ?? "",
    order: banner?.order ?? 0,
    active: banner?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        imageUrl: form.imageUrl,
        title: form.title || null,
        subtitle: form.subtitle || null,
        redirectUrl: form.redirectUrl || null,
        order: form.order,
        active: form.active,
      };
      if (banner) await updateBanner(banner.id, payload);
      else await createBanner(payload);
      router.push("/banners");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card mt-6 max-w-2xl space-y-5">
      <ImageUploadField
        label="Banner image *"
        value={form.imageUrl}
        onChange={(imageUrl) => setForm({ ...form, imageUrl })}
        folder="restro/banners"
        crop={{
          aspect: BANNER_ASPECT_RATIO,
          outputWidth: BANNER_IMAGE_WIDTH,
          outputHeight: BANNER_IMAGE_HEIGHT,
          title: "Crop banner image",
        }}
        hint={`Wide crop for the homepage (21:9). Required output: ${BANNER_RECOMMENDED_SIZE}. Uploaded as compressed WebP.`}
      />
      <div>
        <label className="admin-label">Title</label>
        <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="admin-label">Subtitle</label>
        <textarea rows={2} className="admin-input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      </div>
      <div>
        <label className="admin-label">Redirect URL (optional)</label>
        <input
          className="admin-input"
          placeholder="/menu or https://..."
          value={form.redirectUrl}
          onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
        />
      </div>
      <div>
        <label className="admin-label">Display order</label>
        <input type="number" className="admin-input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
        Active (visible on homepage)
      </label>
      {error && <p className="admin-error">{error}</p>}
      <button type="submit" disabled={saving || !form.imageUrl} className="admin-btn-primary-lg">
        {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : "Save Banner"}
      </button>
    </form>
  );
}
