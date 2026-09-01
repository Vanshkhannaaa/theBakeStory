import type { Product, ProductVariant } from "@/lib/firebase/types";

export function getProductTitle(product: Product): string {
  return product.title ?? product.name;
}

export function getProductImageUrl(product: Product): string | null {
  return product.imageUrl ?? null;
}

export function getProductSubtitle(product: Product): string | null {
  return product.subtitle ?? product.shortDescription ?? null;
}

export function getProductOrder(product: Product): number {
  return product.order;
}

/** Sort products by category order, then product order within each category. */
export function compareProductsByCatalogOrder(
  a: Product & { category: { order: number } },
  b: Product & { category: { order: number } },
) {
  const categoryDiff = a.category.order - b.category.order;
  if (categoryDiff !== 0) return categoryDiff;
  return a.order - b.order;
}

export function isProductActive(product: Product): boolean {
  return product.active;
}

export function getProductVariants(product: Product): ProductVariant[] {
  return product.variants ?? [];
}

export function getDefaultVariant(product: Product): ProductVariant | null {
  const variants = getProductVariants(product);
  if (!variants.length) return null;
  return variants.find((variant) => variant.isDefault) ?? variants[0];
}

export function getDisplayPrice(product: Product): number | null {
  const prices = getProductVariants(product)
    .map((variant) => variant.displayPrice)
    .filter((price): price is number => price != null && price > 0);

  if (!prices.length) return null;
  return Math.min(...prices);
}

export function getOriginalPrice(product: Product): number | null {
  const variant = getDefaultVariant(product);
  if (variant?.originalPrice != null) return variant.originalPrice;

  const displayPrice = getDisplayPrice(product);
  const originalPrices = getProductVariants(product)
    .map((variant) => variant.originalPrice)
    .filter((price): price is number => price != null && price > 0);

  if (!originalPrices.length) return null;

  const maxOriginal = Math.max(...originalPrices);
  if (displayPrice != null && maxOriginal > displayPrice) return maxOriginal;
  return null;
}

export function hasProductDiscount(product: Product): boolean {
  const display = getDisplayPrice(product);
  const original = getOriginalPrice(product);
  return original != null && display != null && original > display;
}
