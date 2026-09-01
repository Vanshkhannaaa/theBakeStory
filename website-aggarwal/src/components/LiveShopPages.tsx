"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { SectionHeader } from "@/components/SectionHeader";
import { MenuProductCard } from "@/components/MenuProductCard";
import { getLiveActiveCategories, getLiveCategoryBySlug, getLiveProducts } from "@/lib/public-catalog";
import type { CategoryWithCount, CategoryWithProducts, ProductWithCategory } from "@/lib/firebase/types";

export function LiveShopPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getLiveActiveCategories(), getLiveProducts()])
      .then(([nextCategories, nextProducts]) => {
        setCategories(nextCategories);
        setProducts(nextProducts);
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Shop" subtitle="Freshly baked collections. Prices exclusive of taxes." />

        {categories.length > 0 && (
          <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Shop categories">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu/${cat.slug}`}
                className="border border-border bg-surface px-4 py-2 text-xs font-medium tracking-wider text-text uppercase transition-colors hover:border-primary hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:mt-12 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {products.map((product) => (
              <MenuProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-text-muted">
            {loaded ? "Menu items will appear here once configured." : "Loading menu…"}
          </p>
        )}
      </div>
    </div>
  );
}

export function LiveCategoryPage() {
  const params = useParams<{ category?: string }>();
  const pathname = usePathname();
  const slug =
    params.category && params.category !== "cat"
      ? String(params.category)
      : pathname.split("/").filter(Boolean)[1] ?? "";
  const [category, setCategory] = useState<CategoryWithProducts | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    getLiveCategoryBySlug(slug).then(setCategory);
  }, [slug]);

  if (category === undefined) {
    return <p className="bg-white py-24 text-center text-text-muted">Loading collection…</p>;
  }
  if (!category) {
    return <p className="bg-white py-24 text-center text-text-muted">Collection not found.</p>;
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-[family-name:var(--font-manrope)] text-3xl font-medium tracking-[-0.01em] text-[#6b5348] md:text-4xl lg:text-[2.5rem]">
            {category.name}
          </h1>
          {category.subtitle || category.description ? (
            <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">
              {category.subtitle ?? category.description}
            </p>
          ) : null}
        </div>

        {category.products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:mt-12 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {category.products.map((product) => (
              <MenuProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-text-muted">No items in this category yet.</p>
        )}
      </div>
    </div>
  );
}
