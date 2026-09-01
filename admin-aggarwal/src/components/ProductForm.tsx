"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Category, MenuBadge, ProductVariant, ProductWithCategory } from "@/lib/firebase/types";
import { createProduct, updateProduct } from "@/lib/firebase/db";
import { uploadImage } from "@/lib/firebase/client-storage";
import { normalizeProductInput } from "@/lib/product-normalize";
import { productSchema } from "@/lib/validators";
import { createSlug } from "@/lib/utils";
import { ImageUploadField } from "@/components/ImageUploadField";
import { BadgePreview } from "@/components/BadgePreview";
import { PRODUCT_FORM_STEPS, ProductStepBar } from "@/components/ProductStepBar";
import {
  PRODUCT_IMAGE_ASPECT,
  PRODUCT_IMAGE_HEIGHT,
  PRODUCT_IMAGE_SIZE,
  PRODUCT_IMAGE_WIDTH,
} from "@/lib/firebase/constants";

interface ProductFormProps {
  product?: ProductWithCategory;
  categories: Category[];
  badges: MenuBadge[];
}

function newVariant(isDefault = false): ProductVariant {
  return {
    id: crypto.randomUUID(),
    name: isDefault ? "Regular" : "",
    displayPrice: null,
    originalPrice: null,
    isDefault,
  };
}

export function ProductForm({ product, categories, badges }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: product?.title ?? product?.name ?? "",
    subtitle: product?.subtitle ?? product?.shortDescription ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    imageUrl: product?.imageUrl ?? "",
    keywords: (product?.keywords ?? []).join(", "),
    tags: product?.tags ?? [],
    variants: product?.variants?.length ? product.variants : [newVariant(true)],
    active: product?.active ?? true,
  });

  const validateStep = (stepIndex: number): string | null => {
    if (stepIndex === 0) {
      if (!form.title.trim()) return "Title is required";
      if (!form.categoryId) return "Category is required";
    }
    if (stepIndex === 2) {
      if (!form.variants.length) return "Add at least one variant";
      for (const variant of form.variants) {
        if (!variant.name.trim()) return "Each variant needs a name";
        if (variant.displayPrice == null || Number(variant.displayPrice) <= 0) {
          return "Each variant needs a display price";
        }
      }
    }
    return null;
  };

  const goToStep = (index: number) => {
    setError("");
    setStep(index);
  };

  const goNext = () => {
    const stepError = validateStep(step);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, PRODUCT_FORM_STEPS.length - 1));
  };

  const uploadPendingImage = async () => {
    if (!pendingImageFile) return form.imageUrl || null;
    return uploadImage(pendingImageFile, "restro/products");
  };

  const handleSave = async () => {
    for (let i = 0; i < PRODUCT_FORM_STEPS.length; i++) {
      const stepError = validateStep(i);
      if (stepError) {
        setError(stepError);
        setStep(i);
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const imageUrl = await uploadPendingImage();
      const payload = {
        name: form.title.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        imageUrl,
        keywords: form.keywords,
        tags: form.tags,
        variants: form.variants.map((variant, index) => ({
          ...variant,
          name: variant.name.trim(),
          displayPrice: Number(variant.displayPrice),
          originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
          isDefault: index === 0,
        })),
        active: form.active,
      };

      const parsed = productSchema.safeParse({
        ...payload,
        slug: product?.slug || createSlug(payload.name),
        isFeatured: product?.isFeatured ?? false,
        isAvailable: product?.isAvailable ?? true,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid product");
      const normalized = normalizeProductInput({
        ...parsed.data,
        slug: parsed.data.slug || createSlug(parsed.data.name),
      });
      const slug = normalized.slug || createSlug(parsed.data.name);
      if (isEdit) await updateProduct(product!.id, { ...normalized, slug });
      else await createProduct({ ...normalized, slug });

      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], ...patch };
      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, newVariant()] }));
  };

  const removeVariant = (id: string) => {
    setForm((prev) => {
      if (prev.variants.length <= 1) return prev;
      return { ...prev, variants: prev.variants.filter((variant) => variant.id !== id) };
    });
  };

  const toggleBadge = (id: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(id) ? prev.tags.filter((tag) => tag !== id) : [...prev.tags, id],
    }));
  };

  const activeBadges = badges.filter((badge) => badge.active);

  const lastStep = step === PRODUCT_FORM_STEPS.length - 1;

  return (
    <div className="mt-2 w-full">
      <ProductStepBar currentStep={step} onStepClick={goToStep} />

      <div className="admin-card space-y-5">
        {step === 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="admin-label">Title *</label>
                <input
                  required
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Category *</label>
                <select
                  required
                  className="admin-input"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Subtitle</label>
                <input
                  className="admin-input"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Description</label>
                <textarea
                  rows={5}
                  className="admin-input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <ImageUploadField
            label="Product image (optional)"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, imageUrl })}
            pendingFile={pendingImageFile}
            onPendingFileChange={setPendingImageFile}
            deferUpload
            folder="restro/products"
            aspectClass="aspect-square max-w-sm"
            crop={{
              aspect: PRODUCT_IMAGE_ASPECT,
              outputWidth: PRODUCT_IMAGE_WIDTH,
              outputHeight: PRODUCT_IMAGE_HEIGHT,
              title: "Crop product image",
            }}
            hint={`Square crop for the menu grid (1:1). Required output: ${PRODUCT_IMAGE_SIZE}.`}
          />
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ui-text">Variants & pricing</p>
                <p className="text-xs text-ui-muted">Each variant has its own display price. Original price is optional.</p>
              </div>
              <button type="button" onClick={addVariant} className="admin-btn-secondary">
                <Plus size={16} /> Add variant
              </button>
            </div>

            {form.variants.map((variant, index) => (
              <div key={variant.id} className="rounded-lg border border-ui-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ui-text">
                    Variant {index + 1}
                    {index === 0 && <span className="ml-2 text-xs text-ui-muted">(default)</span>}
                  </p>
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="admin-btn-text text-ui-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="admin-label">Name *</label>
                    <input
                      className="admin-input"
                      placeholder="e.g. Regular"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Display price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="admin-input"
                      value={variant.displayPrice ?? ""}
                      onChange={(e) =>
                        updateVariant(index, {
                          displayPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="admin-label">Original price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="admin-input"
                      value={variant.originalPrice ?? ""}
                      onChange={(e) =>
                        updateVariant(index, {
                          originalPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="admin-label">Badges</label>
            <p className="mb-3 text-xs text-ui-muted">
              Select badges to highlight this product. Manage badges in the{" "}
              <Link href="/badges" className="admin-link">
                Badges
              </Link>{" "}
              section.
            </p>
            {activeBadges.length === 0 ? (
              <p className="text-sm text-ui-muted">No active badges yet. Add some in the Badges section.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeBadges.map((badge) => {
                  const selected = form.tags.includes(badge.id);
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => toggleBadge(badge.id)}
                      className={`rounded-full transition-transform duration-200 ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--ui-surface)]" : "opacity-70 hover:opacity-100"}`}
                      aria-pressed={selected}
                    >
                      <BadgePreview badge={badge} />
                    </button>
                  );
                })}
              </div>
            )}
            {form.tags.length > 0 && (
              <p className="mt-3 text-xs text-ui-muted">{form.tags.length} badge(s) selected.</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <label className="admin-label">SEO keywords</label>
            <p className="mb-2 text-xs text-ui-muted">Optional comma-separated keywords for search engines.</p>
            <input
              className="admin-input"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="veg, spicy, anniversary cake"
            />
          </div>
        )}

        {error && <p className="admin-error">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ui-border pt-5">
          <Link href="/products" className="admin-btn-secondary">
            Cancel
          </Link>
          <div className="flex gap-3">
            {step > 0 && (
              <button type="button" onClick={() => goToStep(step - 1)} className="admin-btn-secondary">
                Back
              </button>
            )}
            {lastStep ? (
              <button type="button" onClick={() => void handleSave()} disabled={saving} className="admin-btn-primary">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving…
                  </>
                ) : (
                  "Save product"
                )}
              </button>
            ) : (
              <button type="button" onClick={goNext} className="admin-btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
