"use client";

import { useEffect, useRef, useState } from "react";
import { Crop, Loader2, Upload } from "lucide-react";
import { ImageCropDialog } from "@/components/ImageCropDialog";
import { uploadImage } from "@/lib/firebase/client-storage";

export interface ImageCropConfig {
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  title?: string;
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
  aspectClass?: string;
  deferUpload?: boolean;
  pendingFile?: File | null;
  onPendingFileChange?: (file: File | null) => void;
  crop?: ImageCropConfig;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = "restro",
  hint,
  aspectClass = "aspect-[21/9]",
  deferUpload = false,
  pendingFile = null,
  onPendingFileChange,
  crop,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  useEffect(() => {
    return () => {
      if (cropSource) URL.revokeObjectURL(cropSource);
    };
  }, [cropSource]);

  const displaySrc = localPreview ?? pendingPreview ?? value;

  const upload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setUploading(true);
    setError("");

    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setLocalPreview(null);
      setUploading(false);
    }
  };

  const handleFile = (file: File) => {
    if (deferUpload) {
      onPendingFileChange?.(file);
      return;
    }
    void upload(file);
  };

  const openCropper = (file: File) => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    const source = URL.createObjectURL(file);
    setCropSource(source);
    setCropOpen(true);
  };

  const onFileSelected = (file: File) => {
    if (crop) {
      openCropper(file);
      return;
    }
    handleFile(file);
  };

  const clearImage = () => {
    onChange("");
    onPendingFileChange?.(null);
    if (cropSource) {
      URL.revokeObjectURL(cropSource);
      setCropSource(null);
    }
  };

  const hasImage = Boolean(pendingFile || value);

  return (
    <div>
      <label className="admin-label">{label}</label>
      {hint && <p className="mb-2 text-xs text-ui-muted">{hint}</p>}
      <div className={`relative overflow-hidden rounded-lg border border-ui-border bg-ui-surface-muted ${aspectClass}`}>
        {displaySrc ? (
          // Native img: next/image optimizer often fails for Storage URLs on hosted admin.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displaySrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-32 items-center justify-center text-ui-muted">No image</div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <Loader2 className="animate-spin text-white" size={28} />
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={deferUpload ? "admin-btn-secondary" : "admin-btn-primary"}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Compressing…
            </>
          ) : (
            <>
              <Upload size={16} /> {deferUpload ? "Choose image" : "Upload image"}
            </>
          )}
        </button>
        {crop && cropSource && hasImage && !uploading && (
          <button type="button" onClick={() => setCropOpen(true)} className="admin-btn-secondary">
            <Crop size={16} /> Adjust crop
          </button>
        )}
        {hasImage && !uploading && (
          <button type="button" onClick={clearImage} className="text-sm text-ui-muted hover:text-ui-danger">
            Remove
          </button>
        )}
      </div>
      {deferUpload && pendingFile && (
        <p className="mt-2 text-xs text-ui-muted">
          Cropped image will be compressed to WebP and uploaded when you save the product.
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
      {error && <p className="admin-error mt-2">{error}</p>}

      {crop && cropSource && (
        <ImageCropDialog
          open={cropOpen}
          imageSrc={cropSource}
          aspect={crop.aspect}
          outputWidth={crop.outputWidth}
          outputHeight={crop.outputHeight}
          title={crop.title}
          onClose={() => setCropOpen(false)}
          onConfirm={(file) => handleFile(file)}
        />
      )}
    </div>
  );
}
