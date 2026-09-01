"use client";

import { useEffect, useState } from "react";
import { ProductsManager } from "@/components/ProductsManager";
import { getAllProducts, getCategories } from "@/lib/firebase/db";
import type { Category, ProductWithCategory } from "@/lib/firebase/types";

export default function AdminProductsPage() {
  const [data, setData] = useState<{
    products: ProductWithCategory[];
    deleted: ProductWithCategory[];
    categories: Category[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      getAllProducts({ includeInactive: true }),
      getAllProducts({ includeInactive: true, deleted: true }),
      getCategories({ includeInactive: true }),
    ]).then(([products, deleted, categories]) => setData({ products, deleted, categories }));
  }, []);

  if (!data) return <p className="admin-page text-sm text-ui-muted">Loading products…</p>;
  return (
    <ProductsManager
      products={data.products}
      deletedProducts={data.deleted}
      categories={data.categories}
    />
  );
}
