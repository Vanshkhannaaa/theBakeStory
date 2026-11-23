import Image from "next/image";
import Link from "next/link";
import { Baby, Cake, Gem, Heart, PartyPopper, type LucideIcon } from "lucide-react";
import type { Category } from "@/lib/firebase/types";
import { cn } from "@/lib/utils";

interface ShopByOccasionProps {
  categories: Category[];
}

function iconForCategory(name: string): LucideIcon {
  const key = name.toLowerCase();
  if (key.includes("kid") || key.includes("child") || key.includes("baby")) return Baby;
  if (key.includes("wedding") || key.includes("bridal")) return Gem;
  if (key.includes("annivers")) return Heart;
  if (key.includes("party") || key.includes("celebrat")) return PartyPopper;
  return Cake;
}

function OccasionCard({ category }: { category: Category }) {
  const Icon = iconForCategory(category.name);

  return (
    <Link
      href={`/menu/${category.slug}`}
      className="group flex min-h-[7rem] flex-col items-center justify-center gap-2.5 rounded-[14px] bg-white px-2.5 py-4 text-center ring-1 ring-[#ead9c8] transition-[transform,box-shadow,ring-color] duration-200 hover:-translate-y-0.5 hover:ring-[#c4a574] hover:shadow-[0_10px_22px_rgba(63,42,34,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] sm:min-h-[7.75rem] sm:gap-3 sm:px-3 sm:py-5"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4eadf] sm:h-12 sm:w-12">
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            width={40}
            height={40}
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          />
        ) : (
          <Icon className="h-6 w-6 text-[#6b5348] sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden />
        )}
      </span>
      <span className="max-w-[11rem] font-[family-name:var(--font-manrope)] text-[0.82rem] font-medium leading-snug tracking-[-0.01em] text-primary sm:text-[0.95rem]">
        {category.name}
      </span>
    </Link>
  );
}

export function ShopByOccasion({ categories }: ShopByOccasionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-white px-4 pt-8 pb-0 sm:px-6 md:pt-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="catalog-heading mb-4">
          Shop by Occasion
        </h2>
        <div className="rounded-2xl border border-[#e6d3bf] bg-[#f3e6d8] p-2.5 sm:p-3.5 md:p-4">
          <div
            className={cn(
              "grid grid-cols-2 gap-2 sm:gap-3 md:gap-3.5",
              categories.length === 1 && "grid-cols-1 md:max-w-xs",
              categories.length === 2 && "md:grid-cols-2 md:max-w-xl",
              categories.length === 3 && "md:grid-cols-3",
              categories.length >= 4 && "md:grid-cols-4",
            )}
          >
            {categories.map((category) => (
              <OccasionCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
