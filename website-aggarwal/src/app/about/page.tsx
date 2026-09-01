import Link from "next/link";
import { ExternalLink, Heart, Leaf, MapPin, Target, Users } from "lucide-react";
import { AboutMedia } from "@/components/AboutMedia";
import { getAboutUsVideo, getFeaturedProducts, getGalleryImages, getHomepageContent } from "@/lib/data";

export const metadata = {
  title: "About Us | The Bake Story By Aggarwal's",
  description:
    "Welcome to The Bake Story By Aggarwal's in Jalandhar Cantt — handcrafted sweets, bakers’ classics, and warm hospitality.",
};

const ADDRESS = "Jalandhar Cantt, Jalandhar, Punjab 144005";
const MAPS_URL =
  "https://www.google.com/maps/place/aggarwal+sweets+jalandhar/data=!4m2!3m1!1s0x391a594750777e63:0x2a5ac07b050a5e04?sa=X&ved=1t:242&ictx=111";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=Aggarwal+Sweets+Jalandhar+Cantt&z=16&output=embed";

const DEFAULT_ABOUT =
  "At The Bake Story By Aggarwal's, every mithai and baked treat is prepared with care, tradition, and the finest ingredients. From festive boxes to everyday favourites, we bring Jalandhar Cantt the flavours families return for — fresh, pure vegetarian, and made to share.";

const ABOUT_STORY =
  "The counter is a familiar stop for gifting boxes, celebration cakes, namkeen, and the sweets you already know by heart. Walk in the same day, or write to us when you are planning something larger.";

const values = [
  {
    title: "Made with Love",
    description:
      "Every treat is crafted with passion and attention to detail, ensuring each bite is a moment of pure happiness.",
    Icon: Heart,
  },
  {
    title: "Natural Ingredients",
    description:
      "We use only the finest natural ingredients, free from artificial preservatives and additives.",
    Icon: Leaf,
  },
  {
    title: "Quality First",
    description: "Uncompromising quality standards in every product we create.",
    Icon: Target,
  },
  {
    title: "Customer First",
    description: "Our customers' happiness drives everything we do.",
    Icon: Users,
  },
] as const;

export default async function AboutPage() {
  const [content, featured, gallery, aboutVideo] = await Promise.all([
    getHomepageContent(),
    getFeaturedProducts(4),
    getGalleryImages(true),
    getAboutUsVideo(),
  ]);

  const productImages = featured
    .map((p) => p.imageUrl)
    .filter((url): url is string => Boolean(url));
  const galleryImages = gallery.map((g) => g.image).filter(Boolean);

  const primaryImage = content?.aboutImage || productImages[0] || galleryImages[0] || null;
  const secondaryImage =
    productImages.find((url) => url !== primaryImage) ||
    galleryImages.find((url) => url !== primaryImage) ||
    productImages[1] ||
    null;

  const description = content?.aboutDescription?.trim() || DEFAULT_ABOUT;

  return (
    <div className="bg-background">
      <section className="relative flex min-h-[calc(100dvh-var(--header-height))] overflow-hidden bg-[#fff8f1]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,_rgba(196,140,90,0.16)_0%,_transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent"
        />

        <div className="relative mx-auto flex min-h-[calc(100dvh-var(--header-height))] w-full max-w-7xl flex-col items-center justify-center gap-10 px-4 py-10 sm:px-6 md:py-14 lg:flex-row lg:gap-16 lg:px-8 lg:py-12">
          <div className="order-2 lg:order-1">
            <AboutMedia
              videoUrl={aboutVideo?.url}
              videoPoster={aboutVideo?.posterUrl}
              videoTitle={aboutVideo?.title}
              primaryImage={primaryImage}
              secondaryImage={secondaryImage}
            />
          </div>

          <div className="order-1 w-full max-w-xl text-center lg:order-2 lg:text-left">
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.15rem)] leading-[1.12] font-medium tracking-[-0.02em] text-primary">
              Welcome to The Bake Story By Aggarwal's
            </h1>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-text-muted md:text-lg">
              <p>{description}</p>
              <p>{ABOUT_STORY}</p>
            </div>

            <p className="mt-7 inline-flex items-start justify-center gap-2.5 text-base text-text lg:justify-start">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#b06a3a]" aria-hidden />
              <span>{ADDRESS}</span>
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/menu"
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dark"
              >
                Browse the shop
              </Link>
              <Link
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-[#b06a3a] underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
              >
                View on Google Maps
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff8f1] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.15] font-medium tracking-[-0.02em] text-primary">
              What Makes Us Special
            </h2>
            <p className="mt-3 text-base leading-relaxed text-text-muted md:text-lg">
              The habits behind the mithai and bakery — not just the recipes.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {values.map(({ title, description: body, Icon }) => (
              <article
                key={title}
                className="rounded-2xl bg-[#efe4d6] px-6 py-7 transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff8f1]">
                    <Icon className="h-5 w-5 text-[#b06a3a]" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium tracking-[-0.01em] text-primary md:text-xl">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-primary/75 md:text-[0.95rem]">
                      {body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Location + Maps preview */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-[#f3e0d0] px-4 py-1.5 text-sm font-medium text-[#b06a3a]">
              Visit Us
            </span>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(1.9rem,3.6vw,2.85rem)] leading-[1.15] font-medium tracking-[-0.02em] text-primary">
              Find Aggarwal Sweets and Bakers
            </h2>
            <p className="mt-4 text-base text-text-muted md:text-lg">{ADDRESS}</p>
            <Link
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-base font-medium text-[#b06a3a] underline-offset-4 transition-colors hover:text-primary hover:underline md:text-lg"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-border shadow-[0_16px_40px_rgba(42,27,22,0.1)]">
            <iframe
              title="Aggarwal Sweets and Bakers on Google Maps"
              src={MAPS_EMBED}
              className="h-[320px] w-full border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  );
}
