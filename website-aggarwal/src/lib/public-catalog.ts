import * as publicDb from "@/lib/firebase/firestore-public";
import { toDate, toDateOrNull } from "@/lib/firebase/converters";
import { compareProductsByCatalogOrder } from "@/lib/product-display";
import type {
  BannerImage,
  Category,
  CategoryMenuSection,
  CategoryWithCount,
  CategoryWithProducts,
  Product,
  ProductWithCategory,
  Video,
  VideoStatus,
} from "@/lib/firebase/types";

function mapCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: String(data.name ?? ""),
    categoryId: String(data.categoryId ?? id),
    slug: String(data.slug ?? ""),
    description: (data.description as string | null) ?? null,
    subtitle: (data.subtitle as string | null) ?? (data.description as string | null) ?? null,
    image: (data.image as string | null) ?? null,
    order: Number(data.order ?? 0),
    active: data.active !== false,
    deleted: data.deleted === true,
    totalProducts: Number(data.totalProducts ?? 0),
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDate(data.updatedAt),
  };
}

function mapProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: String(data.name ?? ""),
    title: (data.title as string | null) ?? String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    description: (data.description as string | null) ?? null,
    shortDescription: (data.shortDescription as string | null) ?? (data.subtitle as string | null) ?? null,
    subtitle: (data.subtitle as string | null) ?? (data.shortDescription as string | null) ?? null,
    categoryId: String(data.categoryId ?? ""),
    imageUrl: (data.imageUrl as string | null) ?? null,
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
    variants: Array.isArray(data.variants) ? (data.variants as Product["variants"]) : [],
    isFeatured: data.isFeatured === true,
    isAvailable: data.isAvailable !== false,
    active: data.active === true,
    deleted: data.deleted === true,
    order: Number(data.order ?? 0),
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDate(data.updatedAt),
  };
}

function mapBanner(id: string, data: Record<string, unknown>): BannerImage {
  return {
    id,
    imageUrl: String(data.imageUrl ?? ""),
    title: (data.title as string | null) ?? null,
    subtitle: (data.subtitle as string | null) ?? null,
    redirectUrl: (data.redirectUrl as string | null) ?? null,
    order: Number(data.order ?? 0),
    active: data.active !== false,
    deleted: data.deleted === true,
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDateOrNull(data.updatedAt) ?? new Date(),
  };
}

function mapVideo(id: string, data: Record<string, unknown>): Video {
  return {
    id,
    url: (data.url as string | null) ?? null,
    order: Number(data.order ?? 0),
    active: data.active !== false,
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDateOrNull(data.updatedAt) ?? new Date(),
    isAboutUsVideo: data.isAboutUsVideo === true,
    status: (data.status as VideoStatus) || "processing",
    originalPath: String(data.originalPath ?? ""),
    optimizedPath: (data.optimizedPath as string | null) ?? null,
    posterUrl: (data.posterUrl as string | null) ?? null,
    title: (data.title as string | null) ?? null,
    error: (data.error as string | null) ?? null,
  };
}

export async function getLiveCategories(): Promise<Category[]> {
  const docs = await publicDb.getPublicCategories();
  return docs.map((doc) => mapCategory(doc.id, doc.data)).filter((c) => c.active && !c.deleted);
}

export async function getLiveProducts(): Promise<ProductWithCategory[]> {
  const [productDocs, categoryDocs] = await Promise.all([
    publicDb.getPublicProducts(),
    publicDb.getPublicCategories(),
  ]);
  const catMap = new Map(categoryDocs.map((c) => [c.id, mapCategory(c.id, c.data)]));
  return productDocs
    .map((doc) => {
      const product = mapProduct(doc.id, doc.data);
      const category = catMap.get(product.categoryId);
      if (!category) return null;
      return { ...product, category };
    })
    .filter((p): p is ProductWithCategory => p !== null)
    .sort((a, b) => compareProductsByCatalogOrder(a, b));
}

export async function getLiveMenuCatalog(): Promise<CategoryMenuSection[]> {
  const [categories, products] = await Promise.all([getLiveCategories(), getLiveProducts()]);
  return categories
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      products: products.filter((p) => p.categoryId === category.id && p.isAvailable).sort((a, b) => a.order - b.order),
    }))
    .filter((section) => section.products.length > 0);
}

export async function getLiveCategoryBySlug(slug: string): Promise<CategoryWithProducts | null> {
  const doc = await publicDb.getPublicCategoryBySlug(slug);
  if (!doc) return null;
  const category = mapCategory(doc.id, doc.data);
  const products = (await getLiveProducts())
    .filter((p) => p.categoryId === category.id)
    .sort((a, b) => a.order - b.order);
  return { ...category, products };
}

export async function getLiveProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const products = await getLiveProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getLiveBanners(): Promise<BannerImage[]> {
  const docs = await publicDb.getPublicBanners();
  return docs.map((doc) => mapBanner(doc.id, doc.data));
}

export async function getLiveVideos(): Promise<Video[]> {
  const docs = await publicDb.getPublicVideos();
  return docs.map((doc) => mapVideo(doc.id, doc.data)).sort((a, b) => a.order - b.order);
}

export async function getLiveActiveCategories(): Promise<CategoryWithCount[]> {
  const [categories, products] = await Promise.all([getLiveCategories(), getLiveProducts()]);
  const countMap = new Map<string, number>();
  for (const product of products) {
    countMap.set(product.categoryId, (countMap.get(product.categoryId) ?? 0) + 1);
  }
  return categories.map((c) => ({ ...c, _count: { products: countMap.get(c.id) ?? 0 } }));
}
