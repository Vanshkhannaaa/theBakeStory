"use client";

import { useEffect, useState } from "react";
import { HomeBannerCarousel } from "@/components/HomeBannerCarousel";
import { BrandFeature } from "@/components/BrandFeature";
import { DigitalMenuSections } from "@/components/DigitalMenu";
import { VideoGallery } from "@/components/VideoGallery";
import {
  getLiveBanners,
  getLiveMenuCatalog,
  getLiveVideos,
} from "@/lib/public-catalog";
import type { BannerImage, CategoryMenuSection, Video } from "@/lib/firebase/types";

export function LiveHomeCatalog() {
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [menuSections, setMenuSections] = useState<CategoryMenuSection[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getLiveBanners(), getLiveMenuCatalog(), getLiveVideos()])
      .then(([nextBanners, nextMenu, nextVideos]) => {
        setBanners(nextBanners);
        setMenuSections(nextMenu);
        setVideos(nextVideos);
      })
      .finally(() => setLoaded(true));
  }, []);

  const firstCategories = menuSections.slice(0, 2);
  const restCategories = menuSections.slice(2);

  return (
    <>
      <HomeBannerCarousel banners={banners} />
      <BrandFeature />
      <div className="bg-white">
        {loaded && menuSections.length === 0 ? (
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
        ) : (
          <>
            <DigitalMenuSections sections={firstCategories} />
            <VideoGallery videos={videos} />
            <DigitalMenuSections sections={restCategories} />
          </>
        )}
      </div>
    </>
  );
}
