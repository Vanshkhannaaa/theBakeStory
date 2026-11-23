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
  const ordered = [...section.products].sort((a, b) => a.order - b.order).slice(0, 4);

  return (
    <section className="px-4 pt-8 pb-8 sm:px-6 md:pt-10 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 text-left md:mb-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="catalog-heading min-w-0">
              {section.category.name}
            </h2>
            <Link
              href={`/menu/${section.category.slug}`}
              className="inline-flex h-10 shrink-0 items-center justify-center border border-primary px-4 text-[0.68rem] font-medium tracking-[0.16em] text-primary uppercase transition-colors duration-200 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-11 sm:px-6 sm:text-[0.7rem]"
            >
              View All
            </Link>
          </div>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-left text-sm leading-relaxed text-text-muted sm:mt-3 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </header>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 md:grid-cols-4 md:gap-x-8 md:gap-y-8">
          {ordered.map((product) => (
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
          <h2 className="catalog-heading">
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
