"use client";

import { useEffect, useState } from "react";
import { BannersManager } from "@/components/BannersManager";
import { getBanners } from "@/lib/firebase/db";
import type { BannerImage } from "@/lib/firebase/types";

export default function AdminBannersPage() {
  const [data, setData] = useState<{ banners: BannerImage[]; deleted: BannerImage[] } | null>(null);

  useEffect(() => {
    Promise.all([
      getBanners({ includeInactive: true }),
      getBanners({ includeInactive: true, deleted: true }),
    ]).then(([banners, deleted]) => setData({ banners, deleted }));
  }, []);

  if (!data) return <p className="admin-page text-sm text-ui-muted">Loading banners…</p>;
  return <BannersManager banners={data.banners} deletedBanners={data.deleted} />;
}
