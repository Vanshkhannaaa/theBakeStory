import { LiveProductPage } from "@/components/LiveProductPage";
import { getLiveProducts } from "@/lib/public-catalog";

export async function generateStaticParams() {
  const products = await getLiveProducts();
  return products.map((product) => ({
    category: product.category.slug,
    product: product.slug,
  }));
}

export default function ProductPage() {
  return <LiveProductPage />;
}
