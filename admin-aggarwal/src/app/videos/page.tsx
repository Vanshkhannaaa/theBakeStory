"use client";

import { useEffect, useState } from "react";
import { VideosManager } from "@/components/VideosManager";
import { getVideos } from "@/lib/firebase/db";
import type { Video } from "@/lib/firebase/types";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[] | null>(null);

  useEffect(() => {
    getVideos().then(setVideos);
  }, []);

  if (!videos) return <p className="admin-page text-sm text-ui-muted">Loading videos…</p>;
  return <VideosManager videos={videos} />;
}
