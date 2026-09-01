import type { MenuBadge } from "@/lib/firebase/types";
import { badgePreviewStyle } from "@/lib/badge-utils";

interface BadgePreviewProps {
  badge: Pick<MenuBadge, "name" | "color">;
  className?: string;
}

export function BadgePreview({ badge, className = "" }: BadgePreviewProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}
      style={badgePreviewStyle(badge.color)}
    >
      {badge.name || "Badge"}
    </span>
  );
}
