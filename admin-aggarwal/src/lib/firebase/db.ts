import type { DocumentData } from "firebase/firestore";
import { adminDb, QueryBuilder } from "./firestore-web";
import { COLLECTIONS, DEFAULT_BADGES, EXTRA_DOC_ID } from "./constants";
import { toDate, toDateOrNull, nowTimestamps, updateTimestamp } from "./converters";
import type {
  AdminProfile,
  Category,
  CategoryWithCount,
  CategoryWithProducts,
  BannerImage,
  Product,
  MenuBadge,
  ProductWithCategory,
  Video,
  VideoStatus,
} from "./types";
import { createSlug } from "@/lib/utils";
import { compareProductsByCatalogOrder } from "@/lib/product-utils";

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapCategory(id: string, data: DocumentData): Category {
  return {
    id,
    name: data.name,
    categoryId: data.categoryId ?? id,
    slug: data.slug,
    description: data.description ?? null,
    subtitle: data.subtitle ?? data.description ?? null,
    image: data.image ?? null,
    order: data.order ?? 0,
    active: data.active ?? true,
    deleted: data.deleted ?? false,
    totalProducts: data.totalProducts ?? 0,
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDate(data.updatedAt),
  };
}

async function getNextCategoryOrder(): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.categories).orderBy("order", "desc").limit(1).get();
  if (snap.empty) return 0;
  return (snap.docs[0].data().order ?? 0) + 1;
}

async function categorySlugExists(name: string, excludeId?: string): Promise<boolean> {
  const slug = createSlug(name.trim());
  const snap = await adminDb.collection(COLLECTIONS.categories).where("slug", "==", slug).get();
  return snap.docs.some((doc) => {
    if (excludeId && doc.id === excludeId) return false;
    const data = doc.data();
    return !data.deleted;
  });
}

function mapProduct(id: string, data: DocumentData): Product {
  return {
    id,
    name: data.name,
    title: data.title ?? data.name,
    slug: data.slug,
    description: data.description ?? null,
    shortDescription: data.shortDescription ?? data.subtitle ?? null,
    subtitle: data.subtitle ?? data.shortDescription ?? null,
    categoryId: data.categoryId,
    imageUrl: data.imageUrl ?? null,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    variants: Array.isArray(data.variants) ? data.variants : [],
    isFeatured: data.isFeatured ?? false,
    isAvailable: data.isAvailable ?? true,
    active: data.active ?? true,
    deleted: data.deleted ?? false,
    order: data.order ?? 0,
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDate(data.updatedAt),
  };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(options?: {
  includeInactive?: boolean;
  deleted?: boolean;
}): Promise<Category[]> {
  const snap = await adminDb.collection(COLLECTIONS.categories).orderBy("order").get();
  let cats = snap.docs.map((doc) => mapCategory(doc.id, doc.data()));

  if (options?.deleted) {
    return cats.filter((c) => c.deleted);
  }

  cats = cats.filter((c) => !c.deleted);
  if (!options?.includeInactive) cats = cats.filter((c) => c.active);
  return cats;
}

export async function getActiveCategories(): Promise<CategoryWithCount[]> {
  const [categories, products] = await Promise.all([
    getCategories({ includeInactive: false }),
    adminDb.collection(COLLECTIONS.products).get(),
  ]);
  const countMap = new Map<string, number>();
  products.docs.forEach((doc) => {
    const product = mapProduct(doc.id, doc.data());
    if (!product.active || product.deleted) return;
    const catId = product.categoryId;
    countMap.set(catId, (countMap.get(catId) ?? 0) + 1);
  });
  return categories.map((c) => ({
    ...c,
    _count: { products: countMap.get(c.id) ?? 0 },
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await adminDb.collection(COLLECTIONS.categories).doc(id).get();
  if (!snap.exists) return null;
  return mapCategory(snap.id, snap.data()!);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithProducts | null> {
  const snap = await adminDb.collection(COLLECTIONS.categories).where("slug", "==", slug).where("active", "==", true).limit(1).get();
  if (snap.empty) return null;
  const category = mapCategory(snap.docs[0].id, snap.docs[0].data());
  const products = await getProductsByCategory(category.id);
  return { ...category, products };
}

export async function createCategory(data: { name: string; subtitle?: string }) {
  const trimmed = data.name.trim();
  if (await categorySlugExists(trimmed)) {
    throw new Error("A category with this name already exists");
  }

  const ref = adminDb.collection(COLLECTIONS.categories).doc();
  const order = await getNextCategoryOrder();
  const timestamps = nowTimestamps();
  const subtitle = data.subtitle?.trim() || null;
  const payload = {
    name: trimmed,
    categoryId: ref.id,
    slug: createSlug(trimmed),
    subtitle,
    description: subtitle,
    order,
    active: true,
    deleted: false,
    totalProducts: 0,
    createDate: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
  await ref.set(payload);
  return mapCategory(ref.id, payload);
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; subtitle: string | null; active: boolean; order: number }>,
) {
  const ref = adminDb.collection(COLLECTIONS.categories).doc(id);
  const patch: Record<string, unknown> = { ...updateTimestamp() };

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (await categorySlugExists(trimmed, id)) {
      throw new Error("A category with this name already exists");
    }
    patch.name = trimmed;
    patch.slug = createSlug(trimmed);
  }
  if (data.subtitle !== undefined) {
    const subtitle = data.subtitle?.trim() || null;
    patch.subtitle = subtitle;
    patch.description = subtitle;
  }
  if (data.order !== undefined) {
    patch.order = data.order;
  }
  if (data.active !== undefined) {
    patch.active = data.active;
  }

  await ref.update(patch);
  const snap = await ref.get();
  return mapCategory(snap.id, snap.data()!);
}

export async function reorderCategories(items: Array<{ id: string; order: number }>) {
  const batch = adminDb.batch();
  const updatedAt = updateTimestamp();
  for (const item of items) {
    const ref = adminDb.collection(COLLECTIONS.categories).doc(item.id);
    batch.update(ref, { order: item.order, ...updatedAt });
  }
  await batch.commit();
}

export async function softDeleteCategory(id: string) {
  await adminDb.collection(COLLECTIONS.categories).doc(id).update({
    deleted: true,
    active: false,
    ...updateTimestamp(),
  });
}

export async function restoreCategory(id: string) {
  const snap = await adminDb.collection(COLLECTIONS.categories).doc(id).get();
  if (!snap.exists) throw new Error("Category not found");
  const data = snap.data()!;
  if (await categorySlugExists(data.name, id)) {
    throw new Error("An active category with this name already exists");
  }
  await adminDb.collection(COLLECTIONS.categories).doc(id).update({
    deleted: false,
    active: true,
    ...updateTimestamp(),
  });
}

export async function countProductsByCategory(categoryId: string): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.products).where("categoryId", "==", categoryId).get();
  return snap.docs.filter((doc) => {
    const product = mapProduct(doc.id, doc.data());
    return product.active && !product.deleted;
  }).length;
}

function mapMenuBadge(data: DocumentData, index: number): MenuBadge {
  return {
    id: String(data.id ?? `badge-${index}`),
    name: data.name ?? "Badge",
    color: data.color ?? "#047857",
    active: data.active ?? true,
    order: data.order ?? index,
  };
}

function defaultBadgesData(): MenuBadge[] {
  return DEFAULT_BADGES.map((badge) => ({ ...badge }));
}

export async function getBadgesData(activeOnly = false): Promise<MenuBadge[]> {
  const snap = await adminDb.collection(COLLECTIONS.extra).doc(EXTRA_DOC_ID).get();
  if (!snap.exists) return activeOnly ? defaultBadgesData().filter((b) => b.active) : defaultBadgesData();

  const badgesData = Array.isArray(snap.data()?.badgesData)
    ? (snap.data()!.badgesData as DocumentData[]).map((item, index) =>
        mapMenuBadge(item, index),
      )
    : defaultBadgesData();

  const sorted = [...badgesData].sort((a, b) => a.order - b.order);
  return activeOnly ? sorted.filter((badge) => badge.active) : sorted;
}

export async function saveBadgesData(badgesData: MenuBadge[]) {
  const ref = adminDb.collection(COLLECTIONS.extra).doc(EXTRA_DOC_ID);
  const normalized = badgesData.map((badge, index) => ({
    id: badge.id,
    name: badge.name.trim(),
    color: badge.color,
    active: badge.active,
    order: index,
  }));
  await ref.set({ badgesData: normalized, ...updateTimestamp() }, { merge: true });
  return getBadgesData(false);
}

// ─── Products ───────────────────────────────────────────────────────────────

async function attachCategory(product: Product): Promise<ProductWithCategory | null> {
  const category = await getCategoryById(product.categoryId);
  if (!category) return null;
  return { ...product, category };
}

export async function getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]> {
  const snap = await adminDb
    .collection(COLLECTIONS.products)
    .where("categoryId", "==", categoryId)
    .get();
  const category = await getCategoryById(categoryId);
  if (!category) return [];
  return snap.docs
    .map((doc) => ({
      ...mapProduct(doc.id, doc.data()),
      category,
    }))
    .filter((p) => p.active && !p.deleted)
    .sort((a, b) => a.order - b.order);
}

export async function getAllProducts(filters?: {
  search?: string;
  categoryId?: string;
  featured?: boolean;
  includeInactive?: boolean;
  deleted?: boolean;
}): Promise<ProductWithCategory[]> {
  let query: QueryBuilder = new QueryBuilder(COLLECTIONS.products);
  if (filters?.categoryId) query = query.where("categoryId", "==", filters.categoryId);
  if (filters?.featured) query = query.where("isFeatured", "==", true);

  const snap = await query.get();
  const categorySnap = await adminDb.collection(COLLECTIONS.categories).get();
  const catMap = new Map(categorySnap.docs.map((doc) => [doc.id, mapCategory(doc.id, doc.data())]));

  let products = snap.docs
    .map((doc) => {
      const product = mapProduct(doc.id, doc.data());
      const category = catMap.get(product.categoryId);
      if (!category) return null;
      return { ...product, category };
    })
    .filter((p): p is ProductWithCategory => p !== null);

  if (filters?.deleted) {
    return products
      .filter((p) => p.deleted)
      .sort((a, b) =>
        filters?.categoryId ? a.order - b.order : compareProductsByCatalogOrder(a, b),
      );
  }

  products = products
    .filter((p) => !p.deleted)
    .filter((p) => filters?.includeInactive || p.active)
    .sort((a, b) =>
      filters?.categoryId ? a.order - b.order : compareProductsByCatalogOrder(a, b),
    );

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  return products;
}

export async function getFeaturedProducts(limit = 6): Promise<ProductWithCategory[]> {
  const snap = await adminDb
    .collection(COLLECTIONS.products)
    .where("isFeatured", "==", true)
    .where("isAvailable", "==", true)
    .get();

  const results: ProductWithCategory[] = [];
  for (const doc of snap.docs) {
    const product = mapProduct(doc.id, doc.data());
    if (!product.active || product.deleted) continue;
    const withCat = await attachCategory(product);
    if (withCat) results.push(withCat);
  }
  return results.sort((a, b) => a.order - b.order).slice(0, limit);
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const snap = await adminDb.collection(COLLECTIONS.products).doc(id).get();
  if (!snap.exists) return null;
  return attachCategory(mapProduct(snap.id, snap.data()!));
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const snap = await adminDb.collection(COLLECTIONS.products).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const product = mapProduct(snap.docs[0].id, snap.docs[0].data());
  if (!product.active || product.deleted) return null;
  return attachCategory(product);
}

/** Next display order within a category (order is scoped per category, not global). */
export async function getNextProductOrder(categoryId: string): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.products).where("categoryId", "==", categoryId).get();
  let max = -1;
  for (const doc of snap.docs) {
    const order = (doc.data().order as number | undefined) ?? 0;
    if (order > max) max = order;
  }
  return max + 1;
}

export async function createProduct(data: Omit<Product, "id" | "updatedAt" | "createDate" | "deleted">) {
  const ref = adminDb.collection(COLLECTIONS.products).doc();
  const timestamps = nowTimestamps();
  const order = await getNextProductOrder(data.categoryId);
  const payload = {
    ...data,
    order,
    deleted: false,
    createDate: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
  await ref.set(payload);
  return getProductById(ref.id);
}

export async function updateProduct(id: string, data: Partial<Omit<Product, "id" | "createDate">>) {
  const ref = adminDb.collection(COLLECTIONS.products).doc(id);
  await ref.update({ ...data, ...updateTimestamp() });
  return getProductById(id);
}

export async function reorderProducts(items: Array<{ id: string; order: number }>) {
  if (items.length === 0) return;

  const refs = items.map((item) => adminDb.collection(COLLECTIONS.products).doc(item.id));
  const snaps = await adminDb.getAll(...refs);
  const categoryIds = new Set(
    snaps.map((snap) => snap.data()?.categoryId as string | undefined).filter(Boolean),
  );
  if (categoryIds.size > 1) {
    throw new Error("Cannot reorder products across categories");
  }

  const batch = adminDb.batch();
  const updatedAt = updateTimestamp();
  for (const item of items) {
    const ref = adminDb.collection(COLLECTIONS.products).doc(item.id);
    batch.update(ref, { order: item.order, ...updatedAt });
  }
  await batch.commit();
}

export async function softDeleteProduct(id: string) {
  await adminDb.collection(COLLECTIONS.products).doc(id).update({
    deleted: true,
    active: false,
    ...updateTimestamp(),
  });
}

async function productSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const snap = await adminDb.collection(COLLECTIONS.products).where("slug", "==", slug).get();
  return snap.docs.some((doc) => {
    if (excludeId && doc.id === excludeId) return false;
    const data = doc.data();
    return !data.deleted;
  });
}

export async function restoreProduct(id: string) {
  const snap = await adminDb.collection(COLLECTIONS.products).doc(id).get();
  if (!snap.exists) throw new Error("Product not found");
  const data = snap.data()!;
  if (await productSlugExists(data.slug, id)) {
    throw new Error("An active product with this slug already exists");
  }
  await adminDb.collection(COLLECTIONS.products).doc(id).update({
    deleted: false,
    active: true,
    ...updateTimestamp(),
  });
}

export async function countProducts(where?: { active?: boolean; isFeatured?: boolean }): Promise<number> {
  let query: QueryBuilder = new QueryBuilder(COLLECTIONS.products);
  if (where?.isFeatured !== undefined) query = query.where("isFeatured", "==", where.isFeatured);
  const snap = await query.get();
  if (where?.active === undefined) return snap.size;
  return snap.docs.filter((doc) => mapProduct(doc.id, doc.data()).active === where.active).length;
}

// ─── Homepage Banners ───────────────────────────────────────────────────────

function mapBanner(id: string, data: DocumentData): BannerImage {
  return {
    id,
    imageUrl: data.imageUrl ?? "",
    title: data.title ?? null,
    subtitle: data.subtitle ?? null,
    redirectUrl: data.redirectUrl ?? null,
    order: data.order ?? 0,
    active: data.active ?? true,
    deleted: data.deleted ?? false,
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDateOrNull(data.updatedAt) ?? new Date(),
  };
}

export async function getBanners(options?: {
  includeInactive?: boolean;
  deleted?: boolean;
}): Promise<BannerImage[]> {
  const snap = await adminDb.collection(COLLECTIONS.banners).orderBy("order").get();
  let banners = snap.docs.map((doc) => mapBanner(doc.id, doc.data()));

  if (options?.deleted) {
    return banners.filter((b) => b.deleted);
  }

  banners = banners.filter((b) => !b.deleted);
  if (!options?.includeInactive) banners = banners.filter((b) => b.active);
  return banners;
}

export async function getBannerById(id: string): Promise<BannerImage | null> {
  const snap = await adminDb.collection(COLLECTIONS.banners).doc(id).get();
  if (!snap.exists) return null;
  return mapBanner(snap.id, snap.data()!);
}

async function getNextBannerOrder(): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.banners).orderBy("order", "desc").limit(1).get();
  if (snap.empty) return 0;
  return (snap.docs[0].data().order ?? 0) + 1;
}

export async function createBanner(
  data: Omit<BannerImage, "id" | "createDate" | "updatedAt" | "deleted" | "order"> & { order?: number },
) {
  const ref = adminDb.collection(COLLECTIONS.banners).doc();
  const timestamps = nowTimestamps();
  const order = data.order ?? (await getNextBannerOrder());
  await ref.set({
    imageUrl: data.imageUrl,
    title: data.title ?? null,
    subtitle: data.subtitle ?? null,
    redirectUrl: data.redirectUrl ?? null,
    order,
    active: data.active,
    deleted: false,
    createDate: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  });
  return getBannerById(ref.id);
}

export async function updateBanner(id: string, data: Partial<Omit<BannerImage, "id" | "createDate">>) {
  const ref = adminDb.collection(COLLECTIONS.banners).doc(id);
  const patch: Record<string, unknown> = { ...updateTimestamp() };
  if (data.imageUrl !== undefined) patch.imageUrl = data.imageUrl;
  if (data.title !== undefined) patch.title = data.title;
  if (data.subtitle !== undefined) patch.subtitle = data.subtitle;
  if (data.redirectUrl !== undefined) patch.redirectUrl = data.redirectUrl;
  if (data.order !== undefined) patch.order = data.order;
  if (data.active !== undefined) patch.active = data.active;
  if (data.deleted !== undefined) patch.deleted = data.deleted;
  await ref.update(patch);
  return getBannerById(id);
}

export async function reorderBanners(items: Array<{ id: string; order: number }>) {
  const batch = adminDb.batch();
  const updatedAt = updateTimestamp();
  for (const item of items) {
    const ref = adminDb.collection(COLLECTIONS.banners).doc(item.id);
    batch.update(ref, { order: item.order, ...updatedAt });
  }
  await batch.commit();
}

export async function softDeleteBanner(id: string) {
  await adminDb.collection(COLLECTIONS.banners).doc(id).update({
    deleted: true,
    active: false,
    ...updateTimestamp(),
  });
}

export async function restoreBanner(id: string) {
  await adminDb.collection(COLLECTIONS.banners).doc(id).update({
    deleted: false,
    active: true,
    ...updateTimestamp(),
  });
}

export async function deleteBanner(id: string) {
  await softDeleteBanner(id);
}

// ─── Videos ─────────────────────────────────────────────────────────────────

function mapVideo(id: string, data: DocumentData): Video {
  const status = (data.status as VideoStatus) || "processing";
  return {
    id,
    url: data.url ?? null,
    order: data.order ?? 0,
    active: data.active !== false,
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDateOrNull(data.updatedAt) ?? new Date(),
    isAboutUsVideo: data.isAboutUsVideo === true,
    status,
    originalPath: data.originalPath ?? "",
    optimizedPath: data.optimizedPath ?? null,
    posterUrl: data.posterUrl ?? null,
    title: data.title ?? null,
    error: data.error ?? null,
  };
}

export async function getVideos(): Promise<Video[]> {
  const snap = await adminDb.collection(COLLECTIONS.videos).orderBy("order").get();
  return snap.docs.map((doc) => mapVideo(doc.id, doc.data()));
}

export async function getVideoById(id: string): Promise<Video | null> {
  const snap = await adminDb.collection(COLLECTIONS.videos).doc(id).get();
  if (!snap.exists) return null;
  return mapVideo(snap.id, snap.data()!);
}

async function getNextVideoOrder(): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.videos).orderBy("order", "desc").limit(1).get();
  if (snap.empty) return 0;
  return (snap.docs[0].data().order ?? 0) + 1;
}

async function clearOtherAboutUsVideos(exceptId: string) {
  const snap = await adminDb
    .collection(COLLECTIONS.videos)
    .where("isAboutUsVideo", "==", true)
    .get();
  if (snap.empty) return;
  const batch = adminDb.batch();
  const updatedAt = updateTimestamp();
  for (const doc of snap.docs) {
    if (doc.id === exceptId) continue;
    batch.update(doc.ref, { isAboutUsVideo: false, ...updatedAt });
  }
  await batch.commit();
}

export async function createVideo(data: {
  title?: string | null;
  posterUrl?: string | null;
  active?: boolean;
  isAboutUsVideo?: boolean;
  originalPath: string;
  order?: number;
}): Promise<Video | null> {
  const ref = adminDb.collection(COLLECTIONS.videos).doc();
  const timestamps = nowTimestamps();
  const order = data.order ?? (await getNextVideoOrder());
  const isAboutUsVideo = data.isAboutUsVideo === true;

  await ref.set({
    url: null,
    order,
    active: data.active !== false,
    createDate: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
    isAboutUsVideo,
    status: "processing",
    originalPath: data.originalPath,
    optimizedPath: null,
    posterUrl: data.posterUrl ?? null,
    title: data.title ?? null,
    error: null,
  });

  if (isAboutUsVideo) {
    await clearOtherAboutUsVideos(ref.id);
  }

  return getVideoById(ref.id);
}

export async function createVideoWithId(
  id: string,
  data: {
    title?: string | null;
    posterUrl?: string | null;
    active?: boolean;
    isAboutUsVideo?: boolean;
    originalPath: string;
    order?: number;
  },
): Promise<Video | null> {
  const ref = adminDb.collection(COLLECTIONS.videos).doc(id);
  const timestamps = nowTimestamps();
  const order = data.order ?? (await getNextVideoOrder());
  const isAboutUsVideo = data.isAboutUsVideo === true;

  await ref.set({
    url: null,
    order,
    active: data.active !== false,
    createDate: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
    isAboutUsVideo,
    status: "processing",
    originalPath: data.originalPath,
    optimizedPath: null,
    posterUrl: data.posterUrl ?? null,
    title: data.title ?? null,
    error: null,
  });

  if (isAboutUsVideo) {
    await clearOtherAboutUsVideos(id);
  }

  return getVideoById(id);
}

export async function updateVideo(
  id: string,
  data: Partial<{
    title: string | null;
    posterUrl: string | null;
    active: boolean;
    isAboutUsVideo: boolean;
    order: number;
    status: VideoStatus;
    originalPath: string;
    url: string | null;
    optimizedPath: string | null;
    error: string | null;
  }>,
) {
  const ref = adminDb.collection(COLLECTIONS.videos).doc(id);
  const patch: Record<string, unknown> = { ...updateTimestamp() };
  if (data.title !== undefined) patch.title = data.title;
  if (data.posterUrl !== undefined) patch.posterUrl = data.posterUrl;
  if (data.active !== undefined) patch.active = data.active;
  if (data.order !== undefined) patch.order = data.order;
  if (data.status !== undefined) patch.status = data.status;
  if (data.originalPath !== undefined) patch.originalPath = data.originalPath;
  if (data.url !== undefined) patch.url = data.url;
  if (data.optimizedPath !== undefined) patch.optimizedPath = data.optimizedPath;
  if (data.error !== undefined) patch.error = data.error;
  if (data.isAboutUsVideo !== undefined) {
    patch.isAboutUsVideo = data.isAboutUsVideo;
  }
  await ref.update(patch);
  if (data.isAboutUsVideo === true) {
    await clearOtherAboutUsVideos(id);
  }
  return getVideoById(id);
}

export async function reorderVideos(items: Array<{ id: string; order: number }>) {
  const batch = adminDb.batch();
  const updatedAt = updateTimestamp();
  for (const item of items) {
    const ref = adminDb.collection(COLLECTIONS.videos).doc(item.id);
    batch.update(ref, { order: item.order, ...updatedAt });
  }
  await batch.commit();
}

export async function deleteVideo(id: string) {
  const video = await getVideoById(id);
  if (!video) return;
  await adminDb.collection(COLLECTIONS.videos).doc(id).delete();
  return video;
}

// ─── Admin Auth ─────────────────────────────────────────────────────────────

export async function getAdminProfile(uid: string): Promise<AdminProfile | null> {
  const snap = await adminDb.collection(COLLECTIONS.admins).doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return {
    uid: snap.id,
    email: d.email,
    name: d.name ?? d.displayName ?? "Admin",
    role: d.role,
    active: d.active !== false,
    createDate: toDateOrNull(d.createDate) ?? undefined,
    updatedAt: toDateOrNull(d.updatedAt) ?? undefined,
  };
}

export async function countCategories(): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.categories).count().get();
  return snap.data().count;
}
