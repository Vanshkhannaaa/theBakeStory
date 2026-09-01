"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2 } from "lucide-react";
import { AdminDialog } from "@/components/AdminDialog";
import { getCroppedImageFile } from "@/lib/crop-image";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  title?: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
}

export function ImageCropDialog({
  open,
  imageSrc,
  aspect,
  outputWidth,
  outputHeight,
  title = "Crop image",
  onClose,
  onConfirm,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError("");
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    setError("");
    try {
      const file = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        "cropped-image.jpg",
        outputWidth,
        outputHeight,
      );
      onConfirm(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to crop image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDialog open={open} title={title} onClose={saving ? () => {} : onClose} className="max-w-2xl">
      <div className="px-6 py-5">
        <p className="mb-4 text-sm text-ui-muted">
          Drag to reposition and use the slider to zoom. Output size: {outputWidth} × {outputHeight} px.
        </p>
        <div className="relative h-[min(52vh,420px)] overflow-hidden rounded-xl border border-ui-border bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="mt-4">
          <label className="admin-label">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        {error && <p className="admin-error mt-4">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="admin-btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={saving || !croppedAreaPixels}
            className="admin-btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Applying…
              </>
            ) : (
              "Apply crop"
            )}
          </button>
        </div>
      </div>
    </AdminDialog>
  );
}
