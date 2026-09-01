export {
  getBusinessSettings,
  getHomepageContent,
  getSeoSettings,
  getOpeningHours,
  getActiveCategories,
  getFeaturedProducts,
  getActiveOffers,
  getGalleryImages,
  getCategoryBySlug,
  getProductBySlug,
  getAllProducts,
  getActiveBanners,
  getActiveVideos,
  getAboutUsVideo,
  getMenuCatalog,
} from "@/lib/firebase/db";

import { getSocialLinks as getSocialLinksFromDb } from "@/lib/firebase/db";

export async function getSocialLinks() {
  return getSocialLinksFromDb(true);
}
