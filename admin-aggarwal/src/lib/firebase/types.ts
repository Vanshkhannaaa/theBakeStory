export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  role?: string;
  password?: string;
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
  /** Featured in the homepage Shop by Occasion row. Missing Firestore field is treated as false. */
  topCategory: boolean;
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

export interface ProductTag {
  id: string;
  key: string;
  label: string;
  order: number;
  active: boolean;
}

export interface MenuBadge {
  id: string;
  name: string;
  color: string;
  active: boolean;
  order: number;
}

export interface ExtraDoc {
  badgesData: MenuBadge[];
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
  tags?: string[];
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

export interface CategoryWithCount extends Category {
  _count: { products: number };
}

export interface CategoryWithProducts extends Category {
  products: ProductWithCategory[];
}
