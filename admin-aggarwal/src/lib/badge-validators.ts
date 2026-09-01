import { z } from "zod";

export const menuBadgeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Badge name is required").max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color"),
  active: z.boolean(),
  order: z.coerce.number().int().min(0),
});

export const badgesDataSchema = z.object({
  badgesData: z.array(menuBadgeSchema),
});
