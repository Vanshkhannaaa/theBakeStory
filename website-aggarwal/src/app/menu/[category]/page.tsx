import { notFound } from "next/navigation";
import { MenuProductCard } from "@/components/MenuProductCard";
import { getActiveCategories, getCategoryBySlug } from "@/lib/data";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getActiveCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} | The Bake Story by Aggarwal's`,
    description: category.description ?? `Browse ${category.name} at The Bake Story by Aggarwal's.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-[family-name:var(--font-manrope)] text-3xl font-medium tracking-[-0.01em] text-[#6b5348] md:text-4xl lg:text-[2.5rem]">
            {category.name}
          </h1>
          {(category.subtitle || category.description) ? (
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
