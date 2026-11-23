import Image from "next/image";
import { cn } from "@/lib/utils";

const leftCards = [
  {
    title: "Crafted with Care",
    body: "From celebration cakes to everyday treats, we bake with the same hospitality Aggarwal’s families have trusted for years.",
    shortBody: "Celebration cakes to everyday treats, baked with care.",
  },
  {
    title: "Flavour Worth Returning For",
    body: "Deep chocolate, soft crumb, glossy finish — the kind of taste that makes you come back for another piece.",
    shortBody: "Deep chocolate, soft crumb, and a glossy finish.",
  },
];

const rightCards = [
  {
    title: "Baked Fresh. Always.",
    body: "Soft sponges, rich frostings, and sweets made the same day — so every bite tastes warm, fragrant, and just right.",
    shortBody: "Same-day sponges, frostings, and sweets.",
  },
  {
    title: "A Legacy of Sweetness",
    body: "The Bake Story by Aggarwal’s — time-honoured sweets and bakery flavours loved across Jalandhar, one slice at a time.",
    shortBody: "Time-honoured bakery flavours from Jalandhar.",
  },
];

function ValueCard({
  title,
  body,
  compact = false,
  glass = false,
  className,
}: {
  title: string;
  body: string;
  compact?: boolean;
  glass?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "text-left",
        glass
          ? "glass-card"
          : "rounded-2xl bg-[#efe4d6] shadow-[0_6px_18px_rgba(63,42,34,0.06)]",
        compact ? "rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-3" : "px-4 py-4 sm:px-5 sm:py-4",
        className,
      )}
    >
      <h3
        className={cn(
          "font-[family-name:var(--font-manrope)] font-medium leading-snug tracking-[-0.01em] text-primary",
          compact ? "text-[0.92rem] sm:text-base" : "text-lg sm:text-[1.15rem]",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-1.5 leading-relaxed text-primary/75",
          compact ? "text-[0.72rem] leading-snug sm:text-[0.78rem]" : "text-[0.8rem] sm:text-[0.85rem] sm:leading-[1.55]",
        )}
      >
        {body}
      </p>
    </article>
  );
}

function CakeImage({
  className,
  sizes,
}: {
  className?: string;
  sizes: string;
}) {
  return (
    <Image
      src="/images/feature-chocolate-cake.png"
      alt="Chocolate cake slice from The Bake Story by Aggarwal's"
      width={1024}
      height={1024}
      className={className}
      sizes={sizes}
      priority
    />
  );
}

export function BrandFeature() {
  return (
    <section className="relative overflow-hidden bg-[#fff8f1] py-6 md:py-14 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(196,140,90,0.14)_0%,_transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile / tablet: cake stage with two overlay cards, matching the desktop composition */}
        <div className="relative mx-auto min-h-[16.75rem] w-full max-w-[20.5rem] sm:min-h-[19rem] sm:max-w-[24rem] lg:hidden">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[58%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(139,90,50,0.16)_0%,_transparent_70%)]"
          />
          <CakeImage
            className="relative mx-auto h-auto w-[68%] object-contain"
            sizes="(max-width: 640px) 58vw, 260px"
          />
          <ValueCard
            compact
            glass
            className="absolute top-0 left-0 z-10 w-[58%] max-w-[11.25rem] sm:top-1 sm:max-w-[12.5rem]"
            title={rightCards[0].title}
            body={rightCards[0].shortBody}
          />
          <ValueCard
            compact
            glass
            className="absolute right-0 bottom-0 z-10 w-[60%] max-w-[11.5rem] sm:bottom-1 sm:max-w-[12.75rem]"
            title={leftCards[0].title}
            body={leftCards[0].shortBody}
          />
        </div>

        {/* Desktop: left column bottom half, right column top half */}
        <div className="relative mx-auto hidden min-h-[28rem] w-full max-w-6xl grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)_minmax(0,1fr)] items-stretch gap-x-6 xl:min-h-[30rem] xl:gap-x-8 lg:grid">
          <div className="flex flex-col justify-end gap-3.5 pb-1">
            {leftCards.map((card) => (
              <ValueCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>

          <div className="relative flex items-center justify-center self-center">
            <CakeImage
              className="relative h-auto w-full max-w-[23rem] object-contain xl:max-w-[25rem]"
              sizes="(max-width: 1280px) 23rem, 25rem"
            />
          </div>

          <div className="flex flex-col justify-start gap-3.5 pt-1">
            {rightCards.map((card) => (
              <ValueCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
