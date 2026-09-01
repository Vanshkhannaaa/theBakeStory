import Image from "next/image";
import Link from "next/link";
import type { ProductWithCategory } from "@/lib/firebase/types";
import { formatPrice } from "@/lib/utils";
import {
  getDisplayPrice,
  getOriginalPrice,
  getProductImageUrl,
  getProductTitle,
  hasProductDiscount,
} from "@/lib/product-display";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const href = `/menu/${product.category.slug}/${product.slug}`;
  const imageUrl = getProductImageUrl(product);
  const displayPrice = getDisplayPrice(product);
  const originalPrice = getOriginalPrice(product);
  const showDiscount = hasProductDiscount(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[#e8e0d8] bg-white">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden bg-[#f7f2ec]"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={getProductTitle(product)}
            fill
            className="object-contain object-center p-2 transition-opacity duration-300 group-hover:opacity-95"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/20">
            <span className="font-[family-name:var(--font-manrope)] text-sm tracking-wide">
              The Bake Story
            </span>
          </div>
        )}
        {!product.isAvailable && (
          <span className="absolute top-3 right-3 bg-surface-dark/80 px-2 py-1 text-[10px] tracking-wider text-white uppercase">
            Unavailable
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[10px] font-medium tracking-[0.18em] text-[#9a8578] uppercase">
          {product.category.name}
        </p>

        <h3 className="mt-1.5 line-clamp-2 font-[family-name:var(--font-manrope)] text-[0.95rem] font-semibold text-primary sm:text-base">
          <Link href={href} className="transition-colors hover:text-primary-dark">
            {getProductTitle(product)}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex items-baseline gap-2">
            {displayPrice != null && (
              <span className="text-[0.95rem] font-semibold text-primary sm:text-base">
                {formatPrice(displayPrice)}
              </span>
            )}
            {showDiscount && originalPrice != null && (
              <span className="text-sm text-[#9a8578] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <Link
            href={href}
            className="shrink-0 text-[10px] font-medium tracking-[0.16em] text-[#9a8578] uppercase transition-colors hover:text-primary"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
