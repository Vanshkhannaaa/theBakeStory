import Link from "next/link";
import type { CategoryMenuSection } from "@/lib/firebase/types";
import { MenuProductCard } from "@/components/MenuProductCard";

interface DigitalMenuProps {
  sections: CategoryMenuSection[];
}

function CategorySection({ section }: { section: CategoryMenuSection }) {
  const subtitle =
    section.category.subtitle?.trim() ||
    section.category.description?.trim() ||
    null;

  return (
    <section className="px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-6 flex max-w-2xl flex-col items-center text-center md:mb-8">
          <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-medium tracking-[-0.01em] text-[#6b5348] md:text-4xl lg:text-[2.5rem]">
            {section.category.name}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
              {subtitle}
            </p>
          ) : null}
          <Link
            href={`/menu/${section.category.slug}`}
            className="mt-5 inline-flex min-h-10 items-center justify-center border border-primary px-6 text-[0.7rem] font-medium tracking-[0.16em] text-primary uppercase transition-colors duration-200 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 md:grid-cols-4 md:gap-x-8 md:gap-y-8">
          {section.products.slice(0, 8).map((product) => (
            <MenuProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function DigitalMenu({ sections }: DigitalMenuProps) {
  if (sections.length === 0) {
    return (
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-medium tracking-[-0.01em] text-[#6b5348] md:text-4xl">
            Our Collections
          </h2>
          <p className="mt-4 text-sm text-text-muted sm:text-base">
            Menu items will appear here once added from the admin panel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-white">
      {sections.map((section) => (
        <CategorySection key={section.category.id} section={section} />
      ))}
    </div>
  );
}

export function DigitalMenuSections({ sections }: DigitalMenuProps) {
  return sections.map((section) => (
    <CategorySection key={section.category.id} section={section} />
  ));
}
