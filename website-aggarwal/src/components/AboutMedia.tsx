"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";

interface AboutMediaProps {
  videoUrl?: string | null;
  videoPoster?: string | null;
  videoTitle?: string | null;
  primaryImage?: string | null;
  secondaryImage?: string | null;
}

const FRAME =
  "relative aspect-[9/16] h-[min(28rem,calc(100dvh-var(--header-height)-14rem))] w-auto overflow-hidden rounded-2xl bg-[#efe6dc] shadow-[0_22px_48px_rgba(42,27,22,0.16)] lg:h-[min(36rem,calc(100dvh-var(--header-height)-6.5rem))]";

export function AboutMedia({
  videoUrl,
  videoPoster,
  videoTitle,
  primaryImage,
  secondaryImage,
}: AboutMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
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
      { rootMargin: "40px", threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [videoUrl]);

  return (
    <figure className="relative mx-auto w-fit lg:mx-0">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[78%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(139,90,50,0.2)_0%,_transparent_68%)]"
      />

      {videoUrl ? (
        <div className={FRAME}>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={videoPoster ?? undefined}
            className="absolute inset-0 h-full w-full bg-[#efe6dc] object-cover object-center"
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
            aria-label={videoTitle?.trim() || "About Aggarwal Sweets and Bakers"}
          />
        </div>
      ) : (
        <div className={FRAME}>
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt="Aggarwal Sweets and Bakers specialties"
              fill
              className="object-cover"
              sizes="296px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/5 p-10">
              <BrandLogo className="h-24" />
            </div>
          )}
          {secondaryImage ? (
            <div className="absolute -right-3 -bottom-4 aspect-square w-[38%] overflow-hidden rounded-xl bg-background-secondary shadow-[0_12px_28px_rgba(42,27,22,0.14)]">
              <Image
                src={secondaryImage}
                alt="Fresh sweets from Aggarwal Sweets and Bakers"
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
          ) : null}
        </div>
      )}

      <figcaption className="relative mt-4 text-center text-[0.7rem] tracking-[0.14em] text-text-muted uppercase lg:text-left">
        {videoUrl ? "Our shop in Jalandhar Cantt" : "From the bakery"}
      </figcaption>
    </figure>
  );
}
