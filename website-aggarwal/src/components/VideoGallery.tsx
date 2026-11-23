"use client";

import { useEffect, useRef } from "react";
import type { Video } from "@/lib/firebase/types";

interface VideoGalleryProps {
  videos: Video[];
}

function GalleryClip({ video }: { video: Video }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { rootMargin: "80px", threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!video.url) return null;

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-primary/5 shadow-[0_10px_28px_rgba(42,27,22,0.08)]">
      <video
        ref={ref}
        src={video.url}
        poster={video.posterUrl ?? undefined}
        className="h-full w-full object-cover"
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        aria-label={video.title?.trim() || "Gallery video"}
      />
    </div>
  );
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  if (videos.length === 0) return null;

  return (
    <section className="bg-white px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 text-left md:mb-5">
          <h2 className="catalog-heading">
            Video Gallery
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            Watch our special moments
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:gap-6">
          {videos.map((video) => (
            <GalleryClip key={video.id} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
}
