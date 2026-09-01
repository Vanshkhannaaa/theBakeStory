import type { z } from "zod";
import { productSchema } from "@/lib/validators";

export type ProductInput = z.infer<typeof productSchema>;

export function normalizeProductInput(data: ProductInput) {
  const imageUrl = data.imageUrl?.trim() || null;
  const keywords =
    typeof data.keywords === "string"
      ? data.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : data.keywords ?? [];
  const variants = (data.variants ?? []).map((variant, index) => ({
    ...variant,
    isDefault: variant.isDefault ?? index === 0,
    originalPrice: variant.originalPrice ?? null,
  }));

  return {
    name: data.name,
    title: data.title?.trim() || data.name,
    slug: data.slug,
    description: data.description?.trim() || null,
    shortDescription: data.subtitle?.trim() || data.shortDescription?.trim() || null,
    subtitle: data.subtitle?.trim() || data.shortDescription?.trim() || null,
    categoryId: data.categoryId,
    imageUrl,
    keywords,
    tags: data.tags ?? [],
    variants,
    isFeatured: data.isFeatured,
    isAvailable: data.isAvailable,
    active: data.active,
    order: data.order,
  };
}
