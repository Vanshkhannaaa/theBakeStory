"use client";

import { useEffect, useState } from "react";
import { CategoriesManager } from "@/components/CategoriesManager";
import { getCategories } from "@/lib/firebase/db";
import type { Category } from "@/lib/firebase/types";

export default function AdminCategoriesPage() {
  const [data, setData] = useState<{ categories: Category[]; deleted: Category[] } | null>(null);

  useEffect(() => {
    Promise.all([
      getCategories({ includeInactive: true }),
      getCategories({ includeInactive: true, deleted: true }),
    ]).then(([categories, deleted]) => setData({ categories, deleted }));
  }, []);

  if (!data) return <p className="admin-page text-sm text-ui-muted">Loading categories…</p>;
  return <CategoriesManager categories={data.categories} deletedCategories={data.deleted} />;
}
