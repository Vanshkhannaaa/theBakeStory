"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import type { BannerImage } from "@/lib/firebase/types";
import { cn } from "@/lib/utils";

interface HomeBannerCarouselProps {
  banners: BannerImage[];
}

/** Dilbagh-style: large center, thin side peeks, clear gap. */
const SLIDE_VW = 94;
const GAP_VW = 1.5;
const STEP_VW = SLIDE_VW + GAP_VW;
const EDGE_VW = (100 - SLIDE_VW) / 2;
const DURATION_MS = 700;

function BannerCard({
  banner,
  priority = false,
  active = false,
}: {
  banner: BannerImage;
  priority?: boolean;
  active?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-transparent transition-[transform,aspect-ratio] duration-700 ease-in-out will-change-transform",
        // Same slide width; inactive is 80% as tall (21/7.2 = 21/(9*0.8)).
        active ? "z-10 aspect-[21/9] scale-[1.02]" : "z-0 aspect-[21/8.5] scale-100",
      )}
    >
      <Image
        src={banner.imageUrl}
        alt={banner.title ?? "The Bake Story"}
        fill
        priority={priority}
        className="object-cover object-center"
        sizes="89vw"
      />
    </div>
  );

  if (banner.redirectUrl && active) {
    return (
      <Link href={banner.redirectUrl} className="block h-full w-full">
        {inner}
      </Link>
    );
  }

  return inner;
}

export function HomeBannerCarousel({ banners }: HomeBannerCarouselProps) {
  const count = banners.length;
  const [position, setPosition] = useState(count);
  const [enableTransition, setEnableTransition] = useState(true);
  const timerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);

  const slides = useMemo(() => {
    if (count === 0) return [];
    if (count === 1) return banners;
    return [...banners, ...banners, ...banners];
  }, [banners, count]);

  const settle = useCallback(
    (nextPos: number) => {
      if (count <= 1) {
        lockedRef.current = false;
        return;
      }
      window.setTimeout(() => {
        if (nextPos >= count * 2 || nextPos < count) {
          setEnableTransition(false);
          setPosition(count + (((nextPos % count) + count) % count));
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setEnableTransition(true);
              lockedRef.current = false;
            });
          });
        } else {
          lockedRef.current = false;
        }
      }, DURATION_MS);
    },
    [count],
  );

  const go = useCallback(
    (delta: number) => {
      if (count <= 1 || lockedRef.current) return;
      lockedRef.current = true;
      setEnableTransition(true);
      setPosition((p) => {
        const next = p + delta;
        settle(next);
        return next;
      });
    },
    [count, settle],
  );

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = window.setInterval(() => go(1), 5500);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [count, go, position]);

  if (count === 0) {
    return (
      <section className="bg-transparent px-4 py-8 sm:px-6">
        <div className="mx-auto flex aspect-[21/9] w-[89%] flex-col items-center justify-center rounded-2xl border border-border/40 bg-transparent px-6 text-center">
          <BrandLogo className="h-24 sm:h-28" priority />
          <p className="mt-5 font-[family-name:var(--font-manrope)] text-2xl tracking-[-0.01em] text-[#6b5348] sm:text-3xl">
            Freshly baked everyday
          </p>
          <Link href="/menu" className="btn-primary mt-8 min-w-[180px]">
            Explore Menu
          </Link>
        </div>
      </section>
    );
  }

  if (count === 1) {
    return (
      <section className="bg-transparent pt-0 pb-3">
        <div className="mx-auto w-[89%]">
          <BannerCard banner={banners[0]} priority active />
        </div>
      </section>
    );
  }

  const translateX = `calc(${EDGE_VW}vw - ${position} * ${STEP_VW}vw)`;

  return (
    <section className="relative bg-transparent pt-0 pb-2 sm:pb-3">
      {/* Horizontal clip only via full-bleed track — no filled box around banners */}
      <div className="relative w-full overflow-x-clip overflow-y-visible py-3">
        <div
          className="flex items-center will-change-transform"
          style={{
            gap: `${GAP_VW}vw`,
            transform: `translate3d(${translateX}, 0, 0)`,
            transition: enableTransition
              ? `transform ${DURATION_MS}ms ease-in-out`
              : "none",
          }}
        >
          {slides.map((banner, i) => (
            <div
              key={`${banner.id}-${i}`}
              className={cn(
                "shrink-0 cursor-pointer bg-transparent transition-transform duration-700 ease-in-out",
                i === position ? "z-10" : "z-0",
              )}
              style={{ width: `${SLIDE_VW}vw` }}
              onClick={() => {
                if (i < position) go(-1);
                else if (i > position) go(1);
              }}
            >
              <BannerCard banner={banner} priority={i === count} active={i === position} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
