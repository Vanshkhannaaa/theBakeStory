# Video Gallery + Cloud Function Transcoder

**Date:** 2026-09-01  
**Status:** Approved in chat (videos collection only; CF optimize; homepage gallery after 2 categories; muted autoplay)  
**Apps:** `admin-aggarwal`, `website-aggarwal`, `cf-aggarwal`

## Goal

Admins upload videos once; a Cloud Function converts them to a small web-ready MP4; Firestore stores a simple public `url`. The public homepage shows a Dilbagh-style **Video Gallery** (portrait clips, muted autoplay) after the first two category sections. About Us can resolve its clip via `isAboutUsVideo` without a separate settings document.

## Non-goals

- No `settings/settings` document or denormalized `aboutUsVideoUrl`.
- No third-party transcoder (Mux, Cloudflare Stream, etc.) in v1.
- No browser-side ffmpeg.wasm conversion.
- No replacing the existing image banner carousel with video.
- No dedicated `/videos` public marketing page in v1 (homepage section only).

## Data model

### Collection: `videos`

| Field | Type | Notes |
|-------|------|--------|
| `url` | `string \| null` | Final optimized public HTTPS URL. `null` while processing. |
| `order` | `number` | Sort ascending for gallery display. |
| `active` | `boolean` | Homepage shows only `active === true` and `status === "ready"`. |
| `createDate` | `Timestamp` | Set on create. |
| `updatedAt` | `Timestamp` | Set on create/update/transcode. |
| `isAboutUsVideo` | `boolean` | At most one doc may be `true`. Toggling one on clears others. |
| `status` | `"processing" \| "ready" \| "failed"` | Drives admin UI and public filters. |
| `originalPath` | `string` | Storage path of the uploaded original. |
| `optimizedPath` | `string \| null` | Storage path of the optimized MP4. |
| `posterUrl` | `string \| null` | Optional still image (existing image upload pipeline). |
| `title` | `string \| null` | Optional admin label / accessibility. |
| `error` | `string \| null` | Present when `status === "failed"`. |

**Invariants**

- Creating/updating with `isAboutUsVideo: true` must unset the flag on every other video (transaction or batched write in admin API).
- Public readers only need `active && status === "ready" && url`.

### Constants

Add `videos: "videos"` to `COLLECTIONS` in:

- `admin-aggarwal/src/lib/firebase/constants.ts`
- `website-aggarwal/src/lib/firebase/constants.ts`
- `cf-aggarwal/src/constants.ts`

## Storage layout

| Path | Purpose |
|------|---------|
| `restro/videos/originals/{videoId}.{ext}` | Admin upload (raw). Triggers transcoder. |
| `restro/videos/optimized/{videoId}.mp4` | CF output (web-ready). |
| `restro/videos/posters/{uuid}.webp` | Optional poster via existing image upload. |

Public URL pattern (same as images today):  
`https://storage.googleapis.com/{bucket}/restro/videos/optimized/{videoId}.mp4`

After successful optimize, **delete the original** to control Storage cost. Keep optimized + optional poster.

## Cloud Function: `optimizeVideo`

**Runtime:** Node 20, region `asia-south1`, 2nd gen  
**Trigger:** Storage `onObjectFinalized` when object name matches `restro/videos/originals/`  
**Memory / timeout:** High enough for ffmpeg (recommend 2GiB, 540s); document exact values in implementation plan.

### Pipeline

1. Ignore events that are not under `restro/videos/originals/` (and ignore optimized writes).
2. Parse `videoId` from object name (filename stem must equal Firestore doc id).
3. Download original to `/tmp`.
4. Run ffmpeg → H.264 MP4:
   - Max long edge **1080** (portrait or landscape)
   - `yuv420p`, `-movflags +faststart`
   - CRF ~26 (or equivalent bitrate target for ~1–3 MB / 10s loops)
   - Strip audio (`-an`) so muted autoplay never carries a silent track tax — *or* keep a tiny audio track if product later needs unmute; **v1: strip audio** for size and autoplay simplicity.
5. Upload to `restro/videos/optimized/{videoId}.mp4` with `contentType: video/mp4` and public read (or rely on Storage rules).
6. Update Firestore `videos/{videoId}`: `url`, `optimizedPath`, `status: "ready"`, `updatedAt`, clear `error`.
7. Delete original object.
8. On failure: set `status: "failed"`, `error` message; leave original for retry/debug (or admin re-upload).

### Packaging note

Standard Firebase Functions Node runtimes do **not** ship ffmpeg. Implementation must use one of:

- A maintained ffmpeg static binary bundled/downloaded into the function image, or
- A custom Cloud Functions / Cloud Run container with ffmpeg.

The implementation plan will pick the approach that deploys cleanly with this repo’s `cf-aggarwal` Firebase codebase. Prefer a proven Node + static ffmpeg pattern if it fits size limits; otherwise a small Dockerfile for this one function.

## Admin (`admin-aggarwal`)

### UI

- Sidebar: **Videos**
- List page: thumbnails/poster, title, status badge, active toggle, About Us flag, reorder, delete
- Form: file picker (video), optional title, optional poster, active, isAboutUsVideo
- While `processing`: disable “ready” assumptions; show spinner / “Optimizing…”
- On `failed`: show error + allow replace upload

### APIs

- `GET/POST /api/admin/videos`
- `PATCH/DELETE /api/admin/videos/[id]`
- `POST /api/admin/videos/reorder` (same pattern as banners)
- Upload original via **Admin SDK** to Storage (bypass client Storage size/type rules), create Firestore doc first so `videoId` is known, then upload to `originals/{videoId}`.

Do **not** reuse `/api/admin/upload` (image/Sharp only). Add `/api/admin/videos/upload` (or extend with a dedicated video route) that:

- Auth: `requireAdmin()`
- Accepts video MIME types (`video/mp4`, `video/quicktime`, `video/webm`, etc.)
- Max original size: **50MB** (enough for ~17.5MB sources with headroom)
- Writes original; does not run Sharp/ffmpeg in Next

### Auth / rules

- Firestore: `match /videos/{doc} { allow read: if true; allow write: if isAdmin(); }`
- Storage: extend rules so Admin SDK remains primary writer; if any client path is used later, allow `restro/videos/**` for admins with higher size and `video/.*` (and keep image rules for existing paths). Optimized objects remain publicly readable.

## Website (`website-aggarwal`)

### Homepage layout

Current: Banner → all category sections (`DigitalMenu`).

New:

1. Banner carousel  
2. First **2** category sections  
3. **Video Gallery** section (if ≥1 ready active video)  
4. Remaining category sections  

Refactor `DigitalMenu` (or homepage) to accept a split / inject gallery between index 1 and 2 (0-based: after sections `[0]` and `[1]`).

### Video Gallery UI (ref)

- Centered title: **Video Gallery**
- Subtitle: **Watch our special moments**
- Horizontal row of **portrait (~9:16)** rounded clips (responsive: 4 on desktop, scroll/wrap on mobile)
- Data: `active && status === "ready" && url`, sorted by `order`

### Playback

- **`autoPlay` + `muted` + `playsInline` + `loop`**
- Muted on first load (required for autoplay policies)
- Prefer `preload="metadata"` or lazy mount when near viewport so many videos do not all download at once
- Optional: pause when off-screen via Intersection Observer for fast UX
- Poster image when `posterUrl` is set
- Click may unmute / toggle sound later; **v1: stay muted** (user asked muted autoplay for first time)

### About Us

- Field `isAboutUsVideo` is stored and enforceable in admin.
- Wiring the About page player can be a small follow-up; homepage gallery is in scope for v1. If trivial, include About embed of the flagged video in the same implementation pass.

### Data access

- `getActiveVideos()` in website `db.ts` / public fallback, filtered and sorted as above.
- Types mirrored in website + admin `types.ts`.

## Homepage performance constraints

- Never point the gallery at original uploads.
- Only optimized MP4 URLs on the public site.
- Lazy start / off-screen pause so the page does not “constantly” pull every clip at full bandwidth.
- Keep banner images as today (separate from this feature).

## Testing checklist

- Upload ~17MB source → status processing → ready with smaller MP4 URL  
- Failed encode surfaces in admin  
- Only one `isAboutUsVideo`  
- Reorder + active toggle reflected on homepage  
- Gallery appears only after two categories when enough categories exist; if &lt;2 categories, gallery still appears after whatever categories exist (then remaining none)  
- Muted autoplay works on Chrome + Safari iOS (`playsInline`)  
- Firestore/Storage rules deploy; unauthenticated site can read video docs and play optimized files  

## Open implementation choices (resolved in plan, not blockers)

- Exact ffmpeg binary packaging for Firebase  
- Whether About page player ships in the same PR as the gallery  
- Max original size (default **50MB** unless changed at implementation)
