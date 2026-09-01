import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import type { HomepageContent } from "@/lib/firebase/types";

interface HeroProps {
  content: HomepageContent | null;
}

export function Hero({ content }: HeroProps) {
  const eyebrow = content?.heroEyebrow ?? "Since 1997";
  const heading = content?.heroHeading ?? "Authentic Flavours. Timeless Tradition.";
  const description =
    content?.heroDescription ??
    "A refined pure vegetarian dining experience by Aggarwals.";
  const primaryCta = content?.heroPrimaryCta ?? "Explore Menu";
  const primaryUrl = content?.heroPrimaryUrl ?? "/menu";
  const secondaryCta = content?.heroSecondaryCta ?? "About Us";
  const secondaryUrl = content?.heroSecondaryUrl && content.heroSecondaryUrl !== "/contact"
    ? content.heroSecondaryUrl
    : "/about";
  const heroImage = content?.heroImage;

  const lines = heading.split(". ").filter(Boolean);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-dark">
      <div className="absolute inset-0">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-dark via-surface-dark to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center fade-in">
        <BrandLogo className="mx-auto mb-8 h-28 sm:h-32" priority />
        <p className="section-eyebrow mb-6 text-gold-light">{eyebrow}</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-medium leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
              {i < lines.length - 1 ? "." : ""}
            </span>
          ))}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-white/80 sm:text-lg">
          {description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={primaryUrl} className="btn-primary min-w-[200px]">
            {primaryCta}
          </Link>
          <Link href={secondaryUrl} className="btn-ghost min-w-[200px]">
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
