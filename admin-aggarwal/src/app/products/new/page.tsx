"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { getBadgesData, getCategories } from "@/lib/firebase/db";
import type { Category, MenuBadge } from "@/lib/firebase/types";

export default function NewProductPage() {
  const [data, setData] = useState<{ categories: Category[]; badges: MenuBadge[] } | null>(null);

  useEffect(() => {
    Promise.all([getCategories({ includeInactive: true }), getBadgesData(true)]).then(
      ([categories, badges]) => setData({ categories, badges }),
    );
  }, []);

  if (!data) return <p className="admin-page text-sm text-ui-muted">Loading…</p>;
  return (
    <div className="admin-page admin-page-centered">
      <ProductForm categories={data.categories} badges={data.badges} />
    </div>
  );
}
