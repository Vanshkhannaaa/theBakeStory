export const COLLECTIONS = {
  admins: "admins",
  categories: "categories",
  products: "products",
  offers: "restro_offers",
  gallery: "restro_gallery",
  settings: "restro_settings",
  openingHours: "restro_opening_hours",
  socialLinks: "restro_social_links",
  banners: "bannerImages",
  videos: "videos",
} as const;

/** Recommended banner crop ratio for homepage carousel */
export const BANNER_ASPECT_RATIO = 21 / 9;
export const BANNER_RECOMMENDED_SIZE = "1920 × 823 px";

export const SETTINGS_DOCS = {
  business: "business",
  homepage: "homepage",
  seo: "seo",
} as const;

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days
