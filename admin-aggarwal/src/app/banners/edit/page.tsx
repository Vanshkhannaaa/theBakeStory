"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BannerForm } from "@/components/BannerForm";
import { getBannerById } from "@/lib/firebase/db";
import type { BannerImage } from "@/lib/firebase/types";

function EditBannerInner() {
  const id = useSearchParams().get("id");
  const [banner, setBanner] = useState<BannerImage | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) {
      setMissing(true);
      return;
    }
    getBannerById(id).then((found) => {
      if (!found || found.deleted) setMissing(true);
      else setBanner(found);
    });
  }, [id]);

  if (missing) return <p className="admin-page text-sm text-ui-muted">Banner not found.</p>;
  if (!banner) return <p className="admin-page text-sm text-ui-muted">Loading banner…</p>;
  return (
    <div className="admin-page">
      <BannerForm banner={banner} />
    </div>
  );
}

export default function EditBannerPage() {
  return (
    <Suspense fallback={<p className="admin-page text-sm text-ui-muted">Loading banner…</p>}>
      <EditBannerInner />
    </Suspense>
  );
}
