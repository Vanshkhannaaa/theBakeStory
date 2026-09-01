import { LiveCategoryPage } from "@/components/LiveShopPages";
import { getLiveActiveCategories } from "@/lib/public-catalog";

export async function generateStaticParams() {
  const categories = await getLiveActiveCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export default function CategoryPage() {
  return <LiveCategoryPage />;
}
