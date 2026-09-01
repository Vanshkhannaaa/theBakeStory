import type { Product } from "@/lib/firebase/types";
import { formatPrice } from "@/lib/utils";

type ProductWithCategoryOrder = Pick<Product, "order"> & {
  category: { order: number };
};

/** Sort products by category order, then product order within each category. */
export function compareProductsByCatalogOrder(a: ProductWithCategoryOrder, b: ProductWithCategoryOrder) {
  const categoryDiff = a.category.order - b.category.order;
  if (categoryDiff !== 0) return categoryDiff;
  return a.order - b.order;
}

export function formatProductVariantPrices(product: Pick<Product, "variants">) {
  const prices = (product.variants ?? [])
    .map((variant) => variant.displayPrice)
    .filter((price): price is number => price != null && price > 0);

  if (!prices.length) return "—";

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}
