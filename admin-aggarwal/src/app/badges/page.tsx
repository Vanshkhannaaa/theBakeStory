"use client";

import { useEffect, useState } from "react";
import { BadgesManager } from "@/components/BadgesManager";
import { getBadgesData } from "@/lib/firebase/db";
import type { MenuBadge } from "@/lib/firebase/types";

export default function BadgesPage() {
  const [badges, setBadges] = useState<MenuBadge[] | null>(null);

  useEffect(() => {
    getBadgesData(false).then(setBadges);
  }, []);

  if (!badges) return <p className="admin-page text-sm text-ui-muted">Loading badges…</p>;
  return <BadgesManager badges={badges} />;
}
