"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VideoForm } from "@/components/VideoForm";
import { getVideoById } from "@/lib/firebase/db";
import type { Video } from "@/lib/firebase/types";

function EditVideoInner() {
  const id = useSearchParams().get("id");
  const [video, setVideo] = useState<Video | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) {
      setMissing(true);
      return;
    }
    getVideoById(id).then((found) => {
      if (!found) setMissing(true);
      else setVideo(found);
    });
  }, [id]);

  if (missing) return <p className="admin-page text-sm text-ui-muted">Video not found.</p>;
  if (!video) return <p className="admin-page text-sm text-ui-muted">Loading video…</p>;
  return <VideoForm video={video} />;
}

export default function EditVideoPage() {
  return (
    <Suspense fallback={<p className="admin-page text-sm text-ui-muted">Loading video…</p>}>
      <EditVideoInner />
    </Suspense>
  );
}
