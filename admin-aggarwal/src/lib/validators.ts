import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  subtitle: z.string().max(300).optional().or(z.literal("")),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120).optional(),
  subtitle: z.string().max(300).optional().nullable().or(z.literal("")),
  active: z.boolean().optional(),
});

export const categoryReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.coerce.number().int().min(0),
    }),
  ),
});

export const productReorderSchema = categoryReorderSchema;

export const bannerReorderSchema = categoryReorderSchema;

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variant name is required"),
  displayPrice: z.coerce.number().positive("Display price is required"),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Title is required"),
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  subtitle: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional().nullable(),
  keywords: z.union([z.array(z.string()), z.string()]).optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  active: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export const bannerSchema = z.object({
  imageUrl: z.string().min(1, "Banner image is required"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  redirectUrl: z.string().optional(),
  order: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export const videoReorderSchema = categoryReorderSchema;

export const videoMetaSchema = z.object({
  title: z.string().optional().nullable(),
  posterUrl: z.string().optional().nullable(),
  active: z.boolean().default(true),
  isAboutUsVideo: z.boolean().default(false),
  order: z.coerce.number().int().optional(),
});

export const videoUpdateSchema = z.object({
  title: z.string().optional().nullable(),
  posterUrl: z.string().optional().nullable(),
  active: z.boolean().optional(),
  isAboutUsVideo: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const resetRequestSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
