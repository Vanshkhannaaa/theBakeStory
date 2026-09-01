import { COLLECTIONS, SETTINGS_DOCS } from "./constants";

const projectId = () =>
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "aggarwal-sweets-d2a16";

const baseUrl = () =>
  `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents`;

type FirestoreValue = Record<string, unknown>;

function decodeValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return new Date(String(value.timestampValue));
  if ("arrayValue" in value) {
    const values = (value.arrayValue as { values?: FirestoreValue[] }).values ?? [];
    return values.map(decodeValue);
  }
  if ("mapValue" in value) {
    const fields = (value.mapValue as { fields?: Record<string, FirestoreValue> }).fields ?? {};
    return decodeFields(fields);
  }
  return null;
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = decodeValue(value);
  }
  return out;
}

async function getDocument(collection: string, docId: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${baseUrl()}/${collection}/${docId}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore read failed (${res.status})`);
  const json = (await res.json()) as { fields?: Record<string, FirestoreValue> };
  return decodeFields(json.fields ?? {});
}

async function runQuery(
  collection: string,
  filters: Array<{ field: string; op: "EQUAL"; value: string | boolean | number }> = [],
  orderBy?: { field: string; direction?: "ASCENDING" | "DESCENDING" },
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: collection }],
  };

  if (filters.length === 1) {
    const f = filters[0];
    structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: f.field },
        op: f.op,
        value:
          typeof f.value === "boolean"
            ? { booleanValue: f.value }
            : typeof f.value === "number"
              ? { integerValue: String(f.value) }
              : { stringValue: f.value },
      },
    };
  }

  if (orderBy) {
    structuredQuery.orderBy = [
      {
        field: { fieldPath: orderBy.field },
        direction: orderBy.direction ?? "ASCENDING",
      },
    ];
  }

  const res = await fetch(`${baseUrl()}:runQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Firestore query failed (${res.status})`);

  const rows = (await res.json()) as Array<{
    document?: { name: string; fields?: Record<string, FirestoreValue> };
  }>;

  return rows
    .filter((row) => row.document)
    .map((row) => {
      const name = row.document!.name;
      const id = name.split("/").pop() ?? "";
      return { id, data: decodeFields(row.document!.fields ?? {}) };
    });
}

export async function getPublicBusinessSettings() {
  return getDocument(COLLECTIONS.settings, SETTINGS_DOCS.business);
}

export async function getPublicHomepageContent() {
  return getDocument(COLLECTIONS.settings, SETTINGS_DOCS.homepage);
}

export async function getPublicSeoSettings() {
  return getDocument(COLLECTIONS.settings, SETTINGS_DOCS.seo);
}

export async function getPublicOpeningHours() {
  const docs = await runQuery(COLLECTIONS.openingHours, [], { field: "dayIndex" });
  return docs.map((d) => ({ id: d.id, ...d.data }));
}

export async function getPublicSocialLinks() {
  const docs = await runQuery(COLLECTIONS.socialLinks);
  return docs.map((d) => ({ id: d.id, ...d.data }));
}

export async function getPublicCategories() {
  const docs = await runQuery(COLLECTIONS.categories, [], { field: "order" });
  return docs.filter((doc) => doc.data.deleted !== true && doc.data.active === true);
}

export async function getPublicProducts(filters?: { featured?: boolean; categoryId?: string }) {
  const docs = await runQuery(COLLECTIONS.products, [], { field: "order" });

  return docs.filter((doc) => {
    const data = doc.data;
    if (data.deleted === true) return false;
    if (data.active !== true) return false;
    if (filters?.featured && !data.isFeatured) return false;
    if (filters?.categoryId && data.categoryId !== filters.categoryId) return false;
    return true;
  });
}

export async function getPublicOffers() {
  const docs = await runQuery(COLLECTIONS.offers, [{ field: "isActive", op: "EQUAL", value: true }], {
    field: "sortOrder",
  });
  return docs;
}

export async function getPublicGalleryImages() {
  const docs = await runQuery(COLLECTIONS.gallery, [{ field: "isActive", op: "EQUAL", value: true }], {
    field: "sortOrder",
  });
  return docs;
}

export async function getPublicBanners() {
  // Equality-only query — no composite index required; sort by order in memory.
  const docs = await runQuery(COLLECTIONS.banners, [{ field: "active", op: "EQUAL", value: true }]);
  return docs
    .filter((d) => d.data.deleted !== true && Boolean(d.data.imageUrl))
    .sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
}

export async function getPublicVideos() {
  const docs = await runQuery(COLLECTIONS.videos, [{ field: "active", op: "EQUAL", value: true }]);
  return docs
    .filter((d) => d.data.status === "ready" && Boolean(d.data.url))
    .sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
}

export async function getPublicCategoryBySlug(slug: string) {
  const docs = await runQuery(COLLECTIONS.categories, [{ field: "slug", op: "EQUAL", value: slug }]);
  const match = docs.find((d) => d.data.deleted !== true && d.data.active === true);
  return match ?? null;
}

export async function getPublicProductBySlug(slug: string) {
  const docs = await runQuery(COLLECTIONS.products, [{ field: "slug", op: "EQUAL", value: slug }]);
  const match = docs.find((d) => d.data.deleted !== true && d.data.active === true);
  return match ?? null;
}
