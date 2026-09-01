import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { MenuProductCard } from "@/components/MenuProductCard";
import { getActiveCategories, getAllProducts } from "@/lib/data";

export const metadata = {
  title: "Shop | The Bake Story by Aggarwal's",
  description: "Browse our bakery collections — cakes, sweets, and freshly baked treats.",
};

export default async function MenuPage() {
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getAllProducts(),
  ]);

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
            Menu items will appear here once configured.
          </p>
        )}
      </div>
    </div>
  );
}
