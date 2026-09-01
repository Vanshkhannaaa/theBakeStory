"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { getBadgesData, getCategories, getProductById } from "@/lib/firebase/db";
import type { Category, MenuBadge, ProductWithCategory } from "@/lib/firebase/types";

function EditProductInner() {
  const id = useSearchParams().get("id");
  const [data, setData] = useState<{
    product: ProductWithCategory;
    categories: Category[];
    badges: MenuBadge[];
  } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) {
      setMissing(true);
      return;
    }
    Promise.all([
      getProductById(id),
      getCategories({ includeInactive: true }),
      getBadgesData(true),
    ]).then(([product, categories, badges]) => {
      if (!product) setMissing(true);
      else setData({ product, categories, badges });
    });
  }, [id]);

  if (missing) return <p className="admin-page text-sm text-ui-muted">Product not found.</p>;
  if (!data) return <p className="admin-page text-sm text-ui-muted">Loading product…</p>;
  return (
    <div className="admin-page admin-page-centered">
      <ProductForm product={data.product} categories={data.categories} badges={data.badges} />
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<p className="admin-page text-sm text-ui-muted">Loading product…</p>}>
      <EditProductInner />
    </Suspense>
  );
}
