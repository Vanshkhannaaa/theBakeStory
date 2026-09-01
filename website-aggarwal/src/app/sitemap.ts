import type { MetadataRoute } from "next";
import { getCategories, getAllProducts } from "@/lib/firebase/db";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const [categories, products] = await Promise.all([
      getCategories(false),
      getAllProducts(),
    ]);

    const staticPages = ["", "/menu", "/about"].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }));

    const categoryPages = categories.map((c) => ({
      url: `${baseUrl}/menu/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const productPages = products.map((p) => ({
      url: `${baseUrl}/menu/${p.category.slug}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch {
    return [{ url: baseUrl, lastModified: new Date() }];
  }
}
