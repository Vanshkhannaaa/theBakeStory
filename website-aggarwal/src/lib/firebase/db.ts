import { adminDb } from "./admin";
import { COLLECTIONS, SETTINGS_DOCS } from "./constants";
import { toDate, toDateOrNull, nowTimestamps, updateTimestamp } from "./converters";
import * as publicDb from "./firestore-public";
import { withFirestoreRead } from "./safe-read";
import type {
  AdminProfile,
  BusinessSettings,
  Category,
  CategoryWithCount,
  CategoryWithProducts,
  GalleryImage,
  CategoryMenuSection,
  BannerImage,
  HomepageContent,
  Offer,
  OpeningHour,
  Product,
  ProductWithCategory,
  SeoSettings,
  SocialLink,
  Video,
  VideoStatus,
} from "./types";
import { isOfferVisible } from "@/lib/utils";
import { compareProductsByCatalogOrder } from "@/lib/product-display";

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapCategory(id: string, data: FirebaseFirestore.DocumentData): Category {
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

function mapProduct(id: string, data: FirebaseFirestore.DocumentData): Product {
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

function mapOffer(id: string, data: FirebaseFirestore.DocumentData): Offer {
  return {
    id,
    title: data.title,
    description: data.description ?? null,
    image: data.image ?? null,
    discount: data.discount ?? null,
    validFrom: toDateOrNull(data.validFrom),
    validUntil: toDateOrNull(data.validUntil),
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapGallery(id: string, data: FirebaseFirestore.DocumentData): GalleryImage {
  return {
    id,
    image: data.image,
    caption: data.caption ?? null,
    altText: data.altText ?? null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.business).get();
      if (!snap.exists) return null;
      const d = snap.data()!;
      return {
        id: "default",
        businessName: d.businessName ?? "RESTRO by Aggarwals",
        logo: d.logo ?? null,
        favicon: d.favicon ?? null,
        tagline: d.tagline ?? null,
        description: d.description ?? null,
        phone: d.phone ?? null,
        whatsapp: d.whatsapp ?? null,
        email: d.email ?? null,
        address: d.address ?? null,
        mapsUrl: d.mapsUrl ?? null,
        siteVisible: d.siteVisible ?? true,
        createdAt: toDate(d.createdAt),
        updatedAt: toDate(d.updatedAt),
      };
    },
    async () => {
      const d = await publicDb.getPublicBusinessSettings();
      if (!d) return null;
      return {
        id: "default",
        businessName: String(d.businessName ?? "RESTRO by Aggarwals"),
        logo: (d.logo as string | null) ?? null,
        favicon: (d.favicon as string | null) ?? null,
        tagline: (d.tagline as string | null) ?? null,
        description: (d.description as string | null) ?? null,
        phone: (d.phone as string | null) ?? null,
        whatsapp: (d.whatsapp as string | null) ?? null,
        email: (d.email as string | null) ?? null,
        address: (d.address as string | null) ?? null,
        mapsUrl: (d.mapsUrl as string | null) ?? null,
        siteVisible: d.siteVisible !== false,
        createdAt: toDate(d.createdAt),
        updatedAt: toDate(d.updatedAt),
      };
    },
    null,
  );
}

export async function getHomepageContent(): Promise<HomepageContent | null> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.homepage).get();
      if (!snap.exists) return null;
      const d = snap.data()!;
      return { id: "default", ...d, createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as HomepageContent;
    },
    async () => {
      const d = await publicDb.getPublicHomepageContent();
      if (!d) return null;
      return { id: "default", ...d, createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as HomepageContent;
    },
    null,
  );
}

export async function getSeoSettings(): Promise<SeoSettings | null> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.seo).get();
      if (!snap.exists) return null;
      const d = snap.data()!;
      return { id: "default", ...d, createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as SeoSettings;
    },
    async () => {
      const d = await publicDb.getPublicSeoSettings();
      if (!d) return null;
      return { id: "default", ...d, createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as SeoSettings;
    },
    null,
  );
}

export async function getOpeningHours(): Promise<OpeningHour[]> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.openingHours).orderBy("dayIndex").get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as OpeningHour));
    },
    async () => {
      const rows = await publicDb.getPublicOpeningHours();
      return rows.map((row) => row as OpeningHour);
    },
    [],
  );
}

export async function getSocialLinks(activeOnly = false): Promise<SocialLink[]> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.socialLinks).get();
      let links = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SocialLink));
      if (activeOnly) links = links.filter((l) => l.isActive && l.url);
      return links;
    },
    async () => {
      const rows = await publicDb.getPublicSocialLinks();
      let links = rows.map((row) => row as SocialLink);
      if (activeOnly) links = links.filter((l) => l.isActive && l.url);
      return links;
    },
    [],
  );
}

export async function saveSettings(data: {
  business?: Partial<BusinessSettings>;
  homepage?: Partial<HomepageContent>;
  seo?: Partial<SeoSettings>;
  openingHours?: OpeningHour[];
  socialLinks?: SocialLink[];
}) {
  const batch = adminDb.batch();
  const ts = updateTimestamp();

  if (data.business) {
    const ref = adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.business);
    batch.set(ref, { ...data.business, ...ts }, { merge: true });
  }
  if (data.homepage) {
    const ref = adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.homepage);
    batch.set(ref, { ...data.homepage, ...ts }, { merge: true });
  }
  if (data.seo) {
    const ref = adminDb.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.seo);
    batch.set(ref, { ...data.seo, ...ts }, { merge: true });
  }
  if (data.openingHours) {
    for (const hour of data.openingHours) {
      const ref = adminDb.collection(COLLECTIONS.openingHours).doc(hour.day);
      batch.set(ref, hour, { merge: true });
    }
  }
  if (data.socialLinks) {
    for (const link of data.socialLinks) {
      const ref = adminDb.collection(COLLECTIONS.socialLinks).doc(link.platform);
      batch.set(ref, link, { merge: true });
    }
  }
  await batch.commit();
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(includeInactive = false): Promise<Category[]> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.categories).orderBy("order").get();
      let cats = snap.docs.map((doc) => mapCategory(doc.id, doc.data()));
      if (!includeInactive) cats = cats.filter((c) => c.active);
      return cats;
    },
    async () => {
      const docs = await publicDb.getPublicCategories();
      let cats = docs.map((doc) => mapCategory(doc.id, doc.data));
      if (!includeInactive) cats = cats.filter((c) => c.active);
      return cats;
    },
    [],
  );
}

export async function getActiveCategories(): Promise<CategoryWithCount[]> {
  return withFirestoreRead(
    async () => {
      const [categories, products] = await Promise.all([
        getCategories(false),
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
    },
    async () => {
      const [categoryDocs, productDocs] = await Promise.all([
        publicDb.getPublicCategories(),
        publicDb.getPublicProducts(),
      ]);
      const categories = categoryDocs.map((doc) => mapCategory(doc.id, doc.data));
      const countMap = new Map<string, number>();
      productDocs.forEach((doc) => {
        const catId = String(doc.data.categoryId);
        countMap.set(catId, (countMap.get(catId) ?? 0) + 1);
      });
      return categories.map((c) => ({
        ...c,
        _count: { products: countMap.get(c.id) ?? 0 },
      }));
    },
    [],
  );
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.categories).doc(id).get();
      if (!snap.exists) return null;
      return mapCategory(snap.id, snap.data()!);
    },
    async () => {
      const docs = await publicDb.getPublicCategories();
      const doc = docs.find((d) => d.id === id);
      if (!doc) return null;
      return mapCategory(doc.id, doc.data);
    },
    null,
  );
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithProducts | null> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb
        .collection(COLLECTIONS.categories)
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snap.empty) return null;
      const category = mapCategory(snap.docs[0].id, snap.docs[0].data());
      if (!category.active || category.deleted) return null;
      const products = await getProductsByCategory(category.id);
      return { ...category, products };
    },
    async () => {
      const doc = await publicDb.getPublicCategoryBySlug(slug);
      if (!doc) return null;
      const category = mapCategory(doc.id, doc.data);
      const products = await getProductsByCategory(category.id);
      return { ...category, products };
    },
    null,
  );
}

export async function createCategory(data: Omit<Category, "id" | "updatedAt">) {
  const ref = adminDb.collection(COLLECTIONS.categories).doc();
  const timestamps = nowTimestamps();
  await ref.set({ ...data, ...timestamps });
  return mapCategory(ref.id, { ...data, ...timestamps });
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const ref = adminDb.collection(COLLECTIONS.categories).doc(id);
  await ref.update({ ...data, ...updateTimestamp() });
  const snap = await ref.get();
  return mapCategory(snap.id, snap.data()!);
}

export async function deleteCategory(id: string) {
  const count = await countProductsByCategory(id);
  if (count > 0) throw new Error(`Cannot delete: ${count} products in this category`);
  await adminDb.collection(COLLECTIONS.categories).doc(id).delete();
}

export async function countProductsByCategory(categoryId: string): Promise<number> {
  const snap = await adminDb.collection(COLLECTIONS.products).where("categoryId", "==", categoryId).get();
  return snap.docs.filter((doc) => {
    const product = mapProduct(doc.id, doc.data());
    return product.active && !product.deleted;
  }).length;
}

// ─── Products ───────────────────────────────────────────────────────────────

async function attachCategory(product: Product): Promise<ProductWithCategory | null> {
  const category = await getCategoryById(product.categoryId);
  if (!category) return null;
  return { ...product, category };
}

export async function getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]> {
  return withFirestoreRead(
    async () => {
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
    },
    async () => {
      const category = await getCategoryById(categoryId);
      if (!category) return [];
      const docs = await publicDb.getPublicProducts({ categoryId });
      return docs
        .map((doc) => ({
          ...mapProduct(doc.id, doc.data),
          category,
        }))
        .filter((p) => p.active && !p.deleted)
        .sort((a, b) => a.order - b.order);
    },
    [],
  );
}

export async function getAllProducts(filters?: {
  search?: string;
  categoryId?: string;
  featured?: boolean;
  includeInactive?: boolean;
}): Promise<ProductWithCategory[]> {
  return withFirestoreRead(
    async () => {
      let query: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.products);
      if (filters?.categoryId) query = query.where("categoryId", "==", filters.categoryId);
      if (filters?.featured) query = query.where("isFeatured", "==", true);

      const snap = await query.get();
      const categories = await getCategories(true);
      const catMap = new Map(categories.map((c) => [c.id, c]));

      let products = snap.docs
        .map((doc) => {
          const product = mapProduct(doc.id, doc.data());
          const category = catMap.get(product.categoryId);
          if (!category) return null;
          return { ...product, category };
        })
        .filter((p): p is ProductWithCategory => p !== null)
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
            p.description?.toLowerCase().includes(q),
        );
      }

      return products;
    },
    async () => {
      const [productDocs, categoryDocs] = await Promise.all([
        publicDb.getPublicProducts({
          featured: filters?.featured,
          categoryId: filters?.categoryId,
        }),
        publicDb.getPublicCategories(),
      ]);
      const catMap = new Map(categoryDocs.map((c) => [c.id, mapCategory(c.id, c.data)]));

      let products = productDocs
        .map((doc) => {
          const product = mapProduct(doc.id, doc.data);
          const category = catMap.get(product.categoryId);
          if (!category) return null;
          return { ...product, category };
        })
        .filter((p): p is ProductWithCategory => p !== null)
        .sort((a, b) =>
          filters?.categoryId ? a.order - b.order : compareProductsByCatalogOrder(a, b),
        );

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.shortDescription?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q),
        );
      }

      return products;
    },
    [],
  );
}

export async function getFeaturedProducts(limit = 6): Promise<ProductWithCategory[]> {
  return withFirestoreRead(
    async () => {
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
    },
    async () => {
      const [productDocs, categoryDocs] = await Promise.all([
        publicDb.getPublicProducts({ featured: true }),
        publicDb.getPublicCategories(),
      ]);
      const catMap = new Map(categoryDocs.map((c) => [c.id, mapCategory(c.id, c.data)]));
      return productDocs
        .slice(0, limit)
        .map((doc) => {
          const product = mapProduct(doc.id, doc.data);
          const category = catMap.get(product.categoryId);
          if (!category || !product.isAvailable) return null;
          return { ...product, category };
        })
        .filter((p): p is ProductWithCategory => p !== null);
    },
    [],
  );
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const snap = await adminDb.collection(COLLECTIONS.products).doc(id).get();
  if (!snap.exists) return null;
  return attachCategory(mapProduct(snap.id, snap.data()!));
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb
        .collection(COLLECTIONS.products)
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snap.empty) return null;
      const product = mapProduct(snap.docs[0].id, snap.docs[0].data());
      if (!product.active || product.deleted) return null;
      return attachCategory(product);
    },
    async () => {
      const doc = await publicDb.getPublicProductBySlug(slug);
      if (!doc) return null;
      return attachCategory(mapProduct(doc.id, doc.data));
    },
    null,
  );
}

export async function createProduct(data: Omit<Product, "id" | "updatedAt" | "createDate" | "deleted">) {
  const ref = adminDb.collection(COLLECTIONS.products).doc();
  const timestamps = nowTimestamps();
  const payload = {
    ...data,
    deleted: false,
    createDate: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
  await ref.set(payload);
  return getProductById(ref.id);
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const ref = adminDb.collection(COLLECTIONS.products).doc(id);
  await ref.update({ ...data, ...updateTimestamp() });
  return getProductById(id);
}

export async function deleteProduct(id: string) {
  await adminDb.collection(COLLECTIONS.products).doc(id).delete();
}

export async function countProducts(where?: { active?: boolean; isFeatured?: boolean }): Promise<number> {
  let query: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.products);
  if (where?.isFeatured !== undefined) query = query.where("isFeatured", "==", where.isFeatured);
  const snap = await query.get();
  if (where?.active === undefined) return snap.size;
  return snap.docs.filter((doc) => mapProduct(doc.id, doc.data()).active === where.active).length;
}

// ─── Offers ─────────────────────────────────────────────────────────────────

export async function getOffers(activeOnly = false): Promise<Offer[]> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.offers).orderBy("sortOrder").get();
      let offers = snap.docs.map((doc) => mapOffer(doc.id, doc.data()));
      if (activeOnly) offers = offers.filter(isOfferVisible);
      return offers;
    },
    async () => {
      const docs = await publicDb.getPublicOffers();
      let offers = docs.map((doc) => mapOffer(doc.id, doc.data));
      if (activeOnly) offers = offers.filter(isOfferVisible);
      return offers;
    },
    [],
  );
}

export async function getActiveOffers(): Promise<Offer[]> {
  return getOffers(true);
}

export async function countActiveOffers(): Promise<number> {
  const offers = await getOffers(false);
  return offers.filter((o) => o.isActive).length;
}

// ─── Gallery ────────────────────────────────────────────────────────────────

export async function getGalleryImages(activeOnly = true): Promise<GalleryImage[]> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.gallery).orderBy("sortOrder").get();
      let images = snap.docs.map((doc) => mapGallery(doc.id, doc.data()));
      if (activeOnly) images = images.filter((i) => i.isActive);
      return images;
    },
    async () => {
      const docs = await publicDb.getPublicGalleryImages();
      return docs.map((doc) => mapGallery(doc.id, doc.data));
    },
    [],
  );
}

export async function countGalleryImages(activeOnly = false): Promise<number> {
  const images = await getGalleryImages(!activeOnly);
  return activeOnly ? images.filter((i) => i.isActive).length : images.length;
}

// ─── Homepage Banners ───────────────────────────────────────────────────────

function mapBanner(id: string, data: FirebaseFirestore.DocumentData): BannerImage {
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

export async function getActiveBanners(): Promise<BannerImage[]> {
  return withFirestoreRead(
    async () => {
      // Avoid composite index (active + order): filter active, sort in memory.
      const snap = await adminDb
        .collection(COLLECTIONS.banners)
        .where("active", "==", true)
        .get();
      return snap.docs
        .map((doc) => mapBanner(doc.id, doc.data()))
        .filter((b) => !b.deleted && Boolean(b.imageUrl))
        .sort((a, b) => a.order - b.order);
    },
    async () => {
      const docs = await publicDb.getPublicBanners();
      return docs
        .map((doc) => mapBanner(doc.id, doc.data))
        .sort((a, b) => a.order - b.order);
    },
    [],
  );
}

function mapVideo(id: string, data: FirebaseFirestore.DocumentData): Video {
  return {
    id,
    url: data.url ?? null,
    order: data.order ?? 0,
    active: data.active !== false,
    createDate: toDateOrNull(data.createDate) ?? undefined,
    updatedAt: toDateOrNull(data.updatedAt) ?? new Date(),
    isAboutUsVideo: data.isAboutUsVideo === true,
    status: (data.status as VideoStatus) || "processing",
    originalPath: data.originalPath ?? "",
    optimizedPath: data.optimizedPath ?? null,
    posterUrl: data.posterUrl ?? null,
    title: data.title ?? null,
    error: data.error ?? null,
  };
}

export async function getActiveVideos(): Promise<Video[]> {
  return withFirestoreRead(
    async () => {
      const snap = await adminDb.collection(COLLECTIONS.videos).where("active", "==", true).get();
      return snap.docs
        .map((doc) => mapVideo(doc.id, doc.data()))
        .filter((v) => v.status === "ready" && Boolean(v.url))
        .sort((a, b) => a.order - b.order);
    },
    async () => {
      const docs = await publicDb.getPublicVideos();
      return docs.map((doc) => mapVideo(doc.id, doc.data)).sort((a, b) => a.order - b.order);
    },
    [],
  );
}

export async function getAboutUsVideo(): Promise<Video | null> {
  const videos = await getActiveVideos();
  return videos.find((v) => v.isAboutUsVideo) ?? null;
}

export async function getMenuCatalog(): Promise<CategoryMenuSection[]> {
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getAllProducts({ includeInactive: false }),
  ]);

  return categories
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      products: products
        .filter((p) => p.categoryId === category.id && p.isAvailable)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((section) => section.products.length > 0);
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
