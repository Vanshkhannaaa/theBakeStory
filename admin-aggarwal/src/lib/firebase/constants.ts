export const COLLECTIONS = {
  admins: "admins",
  categories: "categories",
  products: "products",
  banners: "bannerImages",
  extra: "extra",
  videos: "videos",
} as const;

export const VIDEO_ORIGINALS_PREFIX = "restro/videos/originals/";
export const VIDEO_OPTIMIZED_PREFIX = "restro/videos/optimized/";
export const VIDEO_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const EXTRA_DOC_ID = "extra";

export const DEFAULT_BADGES = [
  { id: "recommended", name: "Recommended", color: "#047857", active: true, order: 0 },
  { id: "todays-special", name: "Today's Special", color: "#2563eb", active: true, order: 1 },
  { id: "chef-special", name: "Chef Special", color: "#db2777", active: true, order: 2 },
  { id: "bestseller", name: "Bestseller", color: "#ca8a04", active: true, order: 3 },
  { id: "new", name: "New", color: "#dc2626", active: true, order: 4 },
  { id: "hot", name: "Hot", color: "#65a30d", active: true, order: 5 },
] as const;

export const BANNER_ASPECT_RATIO = 21 / 9;
export const BANNER_IMAGE_WIDTH = 1920;
export const BANNER_IMAGE_HEIGHT = 823;
export const BANNER_RECOMMENDED_SIZE = `${BANNER_IMAGE_WIDTH} × ${BANNER_IMAGE_HEIGHT} px`;

export const PRODUCT_IMAGE_ASPECT = 1;
export const PRODUCT_IMAGE_WIDTH = 1024;
export const PRODUCT_IMAGE_HEIGHT = 1024;
export const PRODUCT_IMAGE_SIZE = `${PRODUCT_IMAGE_WIDTH} × ${PRODUCT_IMAGE_HEIGHT} px`;

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days
