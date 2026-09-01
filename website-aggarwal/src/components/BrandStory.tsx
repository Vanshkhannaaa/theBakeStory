import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import type { HomepageContent } from "@/lib/firebase/types";

interface BrandStoryProps {
  content: HomepageContent | null;
}

export function BrandStory({ content }: BrandStoryProps) {
  const heading = content?.aboutHeading ?? "Our Story";
  const description =
    content?.aboutDescription ??
    "RESTRO by Aggarwals is a pure vegetarian restaurant rooted in tradition since 1997. We bring together authentic Indian flavours, warm hospitality, and memorable dining experiences — good food, great taste, and moments worth savouring.";
  const image = content?.aboutImage;

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
          {image ? (
            <Image
              src={image}
              alt="RESTRO by Aggarwals restaurant"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <BrandLogo className="mb-6 h-28" />
              <p className="font-[family-name:var(--font-cinzel)] text-sm uppercase tracking-[0.3em] text-gold-dark">
                Since 1997
              </p>
            </div>
          )}
        </div>
        <div>
          <p className="section-eyebrow mb-3">— About Us</p>
          <h2 className="section-title text-left">{heading}</h2>
          <div className="divider !mx-0 !ml-0" />
          <p className="mt-6 text-base leading-relaxed text-text-muted">{description}</p>
          <div className="mt-8 inline-flex items-center gap-3 border border-gold/30 bg-gold-light/30 px-6 py-3">
            <span className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-primary">
              1997
            </span>
            <span className="text-sm text-text-muted">Established with passion for pure veg cuisine</span>
          </div>
        </div>
      </div>
    </section>
  );
}
