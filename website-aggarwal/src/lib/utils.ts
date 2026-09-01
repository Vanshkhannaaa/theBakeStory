import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlug(text: string): string {
  return slugifyLib(text, { lower: true, strict: true });
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getOfferStatus(offer: {
  isActive: boolean;
  validFrom?: Date | null;
  validUntil?: Date | null;
}): "Draft" | "Active" | "Scheduled" | "Expired" {
  const now = new Date();
  if (!offer.isActive) return "Draft";
  if (offer.validUntil && offer.validUntil < now) return "Expired";
  if (offer.validFrom && offer.validFrom > now) return "Scheduled";
  return "Active";
}

export function isOfferVisible(offer: {
  isActive: boolean;
  validFrom?: Date | null;
  validUntil?: Date | null;
}): boolean {
  return getOfferStatus(offer) === "Active";
}
