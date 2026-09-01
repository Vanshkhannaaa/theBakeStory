import { HomeBannerCarousel } from "@/components/HomeBannerCarousel";
import { BrandFeature } from "@/components/BrandFeature";
import { DigitalMenuSections } from "@/components/DigitalMenu";
import { VideoGallery } from "@/components/VideoGallery";
import { getActiveBanners, getActiveVideos, getMenuCatalog } from "@/lib/data";

export default async function HomePage() {
  const [banners, menuSections, videos] = await Promise.all([
    getActiveBanners(),
    getMenuCatalog(),
    getActiveVideos(),
  ]);

  const firstCategories = menuSections.slice(0, 2);
  const restCategories = menuSections.slice(2);

  return (
    <>
      <HomeBannerCarousel banners={banners} />
      <BrandFeature />
      <div className="bg-white">
        <DigitalMenuSections sections={firstCategories} />
        <VideoGallery videos={videos} />
        <DigitalMenuSections sections={restCategories} />
        {menuSections.length === 0 ? (
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
        ) : null}
      </div>
    </>
  );
}
