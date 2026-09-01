import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts, getProductBySlug } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import {
  getDisplayPrice,
  getOriginalPrice,
  getProductImageUrl,
  getProductTitle,
  getProductVariants,
  hasProductDiscount,
} from "@/lib/product-display";
import { ArrowLeft, Star } from "lucide-react";

interface Props {
  params: Promise<{ category: string; product: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    category: product.category.slug,
    product: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${getProductTitle(product)} | RESTRO by Aggarwals`,
    description: product.shortDescription ?? product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { category: catSlug, product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.category.slug !== catSlug) notFound();

  const imageUrl = getProductImageUrl(product);
  const variants = getProductVariants(product);
  const displayPrice = getDisplayPrice(product);
  const originalPrice = getOriginalPrice(product);
  const showDiscount = hasProductDiscount(product);

  return (
    <div className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={`/menu/${product.category.slug}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary"
        >
          <ArrowLeft size={16} /> Back to {product.category.name}
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden bg-background-secondary">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={getProductTitle(product)}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-primary/20">
                <span className="font-[family-name:var(--font-display)] text-4xl">The Bake Story</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-dark">
              {product.category.name}
            </p>
            <div className="mt-2 flex items-start gap-3">
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold md:text-4xl">
                {getProductTitle(product)}
              </h1>
              {product.isFeatured && (
                <span className="flex items-center gap-1 bg-gold px-2 py-1 text-[10px] font-semibold uppercase text-primary-dark">
                  <Star size={10} fill="currentColor" /> Featured
                </span>
              )}
            </div>

            {variants.length > 1 ? (
              <div className="mt-4 space-y-2">
                {variants.map((variant) => (
                  <div key={variant.id} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-text-muted">{variant.name}</span>
                    <div className="flex items-baseline gap-2">
                      {variant.displayPrice != null && (
                        <span className="font-semibold text-primary">{formatPrice(variant.displayPrice)}</span>
                      )}
                      {variant.originalPrice != null &&
                        variant.displayPrice != null &&
                        variant.originalPrice > variant.displayPrice && (
                          <span className="text-text-muted line-through">
                            {formatPrice(variant.originalPrice)}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-text-muted">excl. taxes</p>
              </div>
            ) : (
              <div className="mt-4 flex items-baseline gap-3">
                {displayPrice != null && (
                  <span className="text-2xl font-semibold text-primary">{formatPrice(displayPrice)}</span>
                )}
                {showDiscount && originalPrice != null && (
                  <span className="text-lg text-text-muted line-through">{formatPrice(originalPrice)}</span>
                )}
                <span className="text-xs text-text-muted">excl. taxes</span>
              </div>
            )}

            {!product.isAvailable && (
              <p className="mt-2 text-sm font-medium text-primary">Currently unavailable</p>
            )}

            {product.description && (
              <p className="mt-6 leading-relaxed text-text-muted">{product.description}</p>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="https://wa.me/917707887151"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Chat with Us
              </a>
              <Link href="/menu" className="border border-border px-6 py-3 text-xs uppercase tracking-wider hover:border-primary hover:text-primary">
                Browse Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
