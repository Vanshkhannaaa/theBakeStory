import Image from "next/image";

const leftCards = [
  {
    title: "Crafted with Care",
    body: "From celebration cakes to everyday treats, we bake with the same hospitality Aggarwal’s families have trusted for years.",
  },
  {
    title: "Flavour Worth Returning For",
    body: "Deep chocolate, soft crumb, glossy finish — the kind of taste that makes you come back for another piece.",
  },
];

const rightCards = [
  {
    title: "Baked Fresh. Always.",
    body: "Soft sponges, rich frostings, and sweets made the same day — so every bite tastes warm, fragrant, and just right.",
  },
  {
    title: "A Legacy of Sweetness",
    body: "The Bake Story by Aggarwal’s — time-honoured sweets and bakery flavours loved across Jalandhar, one slice at a time.",
  },
];

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl bg-[#efe4d6] px-4 py-4 sm:px-5 sm:py-4">
      <h3 className="font-[family-name:var(--font-manrope)] text-lg font-medium leading-snug tracking-[-0.01em] text-primary sm:text-[1.15rem]">
        {title}
      </h3>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-primary/75 sm:text-[0.85rem] sm:leading-[1.55]">
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
  const allCards = [...rightCards, ...leftCards];

  return (
    <section className="relative overflow-hidden bg-[#fff8f1] py-12 md:py-14 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(196,140,90,0.14)_0%,_transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile */}
        <div className="flex flex-col items-center gap-8 lg:hidden">
          <div className="relative w-full max-w-[16rem] sm:max-w-[18rem]">
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 h-[70%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(139,90,50,0.16)_0%,_transparent_70%)]"
            />
            <CakeImage
              className="relative mx-auto h-auto w-full object-contain"
              sizes="(max-width: 640px) 64vw, 288px"
            />
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 sm:gap-4">
            {allCards.map((card) => (
              <ValueCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </div>

        {/* Desktop: left column bottom half, right column top half */}
        <div className="relative mx-auto hidden min-h-[28rem] w-full max-w-6xl grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)_minmax(0,1fr)] items-stretch gap-x-6 xl:min-h-[30rem] xl:gap-x-8 lg:grid">
          {/* Left — both cards stacked in bottom half */}
          <div className="flex flex-col justify-end gap-3.5 pb-1">
            {leftCards.map((card) => (
              <ValueCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>

          {/* Center cake */}
          <div className="relative flex items-center justify-center self-center">
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 h-[72%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(139,90,50,0.18)_0%,_transparent_68%)]"
            />
            <CakeImage
              className="relative h-auto w-full max-w-[23rem] object-contain xl:max-w-[25rem]"
              sizes="(max-width: 1280px) 23rem, 25rem"
            />
          </div>

          {/* Right — both cards stacked in top half */}
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
