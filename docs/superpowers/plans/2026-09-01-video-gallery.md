# Video Gallery + Transcoder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin uploads videos; Cloud Function optimizes to MP4; homepage shows muted-autoplay Video Gallery after first 2 categories; `isAboutUsVideo` available for About page.

**Architecture:** Create Firestore `videos` docs first, upload originals to `restro/videos/originals/{id}` via Admin SDK, Storage trigger runs ffmpeg and writes optimized URL. Website reads ready+active videos only.

**Tech Stack:** Next.js admin/website, Firebase Admin, Cloud Functions gen2 (asia-south1), `ffmpeg-static` + `fluent-ffmpeg` (or spawn ffmpeg-static path), Firestore + Storage rules.

## Global Constraints

- Collection name: `videos` only (no settings doc)
- Max original upload: 50MB
- Optimized: H.264 MP4, max 1080 long edge, CRF ~26, `-an`, `+faststart`
- Delete original after successful optimize
- Homepage gallery: muted autoplay + playsInline + loop; pause off-screen
- Gallery after first 2 category sections
- Region: asia-south1; memory 2GiB; timeout 540s

---

### Task 1: Shared types, constants, rules

**Files:**
- Modify `cf-aggarwal/src/constants.ts`
- Modify `admin-aggarwal/src/lib/firebase/constants.ts`
- Modify `website-aggarwal/src/lib/firebase/constants.ts`
- Modify `admin-aggarwal/src/lib/firebase/types.ts`
- Modify `website-aggarwal/src/lib/firebase/types.ts`
- Modify `cf-aggarwal/firestore.rules`
- Modify `cf-aggarwal/storage.rules`

- [ ] Add `videos: "videos"` to all COLLECTIONS
- [ ] Add `Video` type + status union in admin + website types
- [ ] Firestore rule for `videos` public read / admin write
- [ ] Storage: public read; keep images under `restro/` with 5MB image rule; add `restro/videos/**` admin write for video up to 50MB (client path safety; Admin SDK still primary)

### Task 2: Cloud Function `optimizeVideo`

**Files:**
- Modify `cf-aggarwal/package.json` (add `ffmpeg-static`, `@ffmpeg-installer/ffmpeg` or `ffmpeg-static`)
- Create `cf-aggarwal/src/optimize-video.ts`
- Modify `cf-aggarwal/src/index.ts` to export function
- Modify `cf-aggarwal/tsconfig.json` if needed for assets

- [ ] Implement Storage `onObjectFinalized` for `restro/videos/originals/`
- [ ] ffmpeg encode → upload optimized → update Firestore → delete original
- [ ] On error set `status: failed`
- [ ] `npm run build` in cf-aggarwal

### Task 3: Admin video APIs + storage helper

**Files:**
- Create `admin-aggarwal/src/lib/firebase/videos.ts` (CRUD helpers) or extend `db.ts` if that pattern exists — prefer mirror banners API pattern
- Create `admin-aggarwal/src/app/api/admin/videos/route.ts`
- Create `admin-aggarwal/src/app/api/admin/videos/[id]/route.ts`
- Create `admin-aggarwal/src/app/api/admin/videos/reorder/route.ts`
- Create `admin-aggarwal/src/app/api/admin/videos/upload/route.ts`
- Extend `admin-aggarwal/src/lib/firebase/storage.ts` with `uploadVideoOriginal`

Follow banners routes for auth/zod/serialize patterns.

### Task 4: Admin Videos UI

**Files:**
- Modify `AdminSidebar.tsx`, `admin-page-meta.ts`
- Create pages under `admin-aggarwal/src/app/videos/`
- Create `VideosManager.tsx`, `VideoForm.tsx` (mirror BannersManager/BannerForm)

### Task 5: Website gallery + About

**Files:**
- Modify `website-aggarwal/src/lib/firebase/db.ts` + `firestore-public.ts` + `data.ts`
- Create `VideoGallery.tsx`
- Modify `page.tsx` / `DigitalMenu.tsx` to split after 2 sections
- Modify `about/page.tsx` to show about video when present

### Task 6: Verify

- [ ] Typecheck admin + website + cf
- [ ] Confirm no Instagram/regression issues
- [ ] Manual checklist from spec
