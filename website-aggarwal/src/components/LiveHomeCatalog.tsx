"use client";

import { useEffect, useState } from "react";
import { HomeBannerCarousel } from "@/components/HomeBannerCarousel";
import { BrandFeature } from "@/components/BrandFeature";
import { DigitalMenuSections } from "@/components/DigitalMenu";
import { VideoGallery } from "@/components/VideoGallery";
import { ShopByOccasion } from "@/components/ShopByOccasion";
import {
  getLiveBanners,
  getLiveMenuCatalog,
  getLiveTopCategories,
  getLiveVideos,
} from "@/lib/public-catalog";
import type { BannerImage, Category, CategoryMenuSection, Video } from "@/lib/firebase/types";

export function LiveHomeCatalog() {
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [menuSections, setMenuSections] = useState<CategoryMenuSection[]>([]);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getLiveBanners(), getLiveMenuCatalog(), getLiveTopCategories(), getLiveVideos()])
      .then(([nextBanners, nextMenu, nextTop, nextVideos]) => {
        setBanners(nextBanners);
        setMenuSections(nextMenu);
        setTopCategories(nextTop);
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
        <ShopByOccasion categories={topCategories} />
        {loaded && menuSections.length === 0 ? (
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
