"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/banners");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ui-muted">
      Redirecting…
    </div>
  );
}
