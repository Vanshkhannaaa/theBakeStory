export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  role?: string;
  active: boolean;
  createDate?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  categoryId: string;
  slug: string;
  description?: string | null;
  subtitle?: string | null;
  image?: string | null;
  order: number;
  active: boolean;
  deleted: boolean;
  totalProducts: number;
  createDate?: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  displayPrice?: number | null;
  originalPrice?: number | null;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  title?: string | null;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  subtitle?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  keywords?: string[];
  variants?: ProductVariant[];
  isFeatured: boolean;
  isAvailable: boolean;
  active: boolean;
  deleted: boolean;
  /** Display order within category (not globally unique). */
  order: number;
  createDate?: Date;
  updatedAt: Date;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface Offer extends Timestamps {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  discount?: string | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
  isActive: boolean;
  sortOrder: number;
}

export interface GalleryImage extends Timestamps {
  id: string;
  image: string;
  caption?: string | null;
  altText?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface BannerImage {
  id: string;
  imageUrl: string;
  title?: string | null;
  subtitle?: string | null;
  redirectUrl?: string | null;
  order: number;
  active: boolean;
  deleted: boolean;
  createDate?: Date;
  updatedAt: Date;
}

export type VideoStatus = "processing" | "ready" | "failed";

export interface Video {
  id: string;
  url: string | null;
  order: number;
  active: boolean;
  createDate?: Date;
  updatedAt: Date;
  isAboutUsVideo: boolean;
  status: VideoStatus;
  originalPath: string;
  optimizedPath: string | null;
  posterUrl?: string | null;
  title?: string | null;
  error?: string | null;
}

export interface BusinessSettings extends Timestamps {
  id: string;
  businessName: string;
  logo?: string | null;
  favicon?: string | null;
  tagline?: string | null;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  siteVisible: boolean;
}

export interface HomepageContent extends Timestamps {
  id: string;
  heroEyebrow?: string | null;
  heroHeading?: string | null;
  heroDescription?: string | null;
  heroImage?: string | null;
  heroPrimaryCta?: string | null;
  heroPrimaryUrl?: string | null;
  heroSecondaryCta?: string | null;
  heroSecondaryUrl?: string | null;
  aboutHeading?: string | null;
  aboutDescription?: string | null;
  aboutImage?: string | null;
}

export interface SeoSettings extends Timestamps {
  id: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  keywords?: string | null;
}

export interface OpeningHour {
  id: string;
  day: string;
  dayIndex: number;
  isOpen: boolean;
  openingTime?: string | null;
  closingTime?: string | null;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
}

export interface CategoryWithCount extends Category {
  _count: { products: number };
}

export interface CategoryWithProducts extends Category {
  products: ProductWithCategory[];
}

export interface CategoryMenuSection {
  category: Category;
  products: ProductWithCategory[];
}
