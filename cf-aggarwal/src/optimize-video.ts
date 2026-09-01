import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import {
  COLLECTIONS,
  VIDEO_OPTIMIZED_PREFIX,
  VIDEO_ORIGINALS_PREFIX,
} from "./constants";

const execFileAsync = promisify(execFile);

function getFfmpegPath(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegStatic = require("ffmpeg-static") as string | null;
  if (!ffmpegStatic) {
    throw new Error("ffmpeg-static binary not found");
  }
  return ffmpegStatic;
}

function videoIdFromOriginalPath(objectName: string): string | null {
  if (!objectName.startsWith(VIDEO_ORIGINALS_PREFIX)) return null;
  const fileName = objectName.slice(VIDEO_ORIGINALS_PREFIX.length);
  if (!fileName || fileName.includes("/")) return null;
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

export const optimizeVideo = onObjectFinalized(
  {
    bucket: "aggarwal-sweets-d2a16.firebasestorage.app",
    region: "asia-south1",
    memory: "2GiB",
    timeoutSeconds: 540,
    cpu: 2,
  },
  async (event) => {
    const objectName = event.data.name;
    const bucketName = event.data.bucket;
    if (!objectName || !bucketName) return;
    if (!objectName.startsWith(VIDEO_ORIGINALS_PREFIX)) return;
    if (objectName.startsWith(VIDEO_OPTIMIZED_PREFIX)) return;

    const videoId = videoIdFromOriginalPath(objectName);
    if (!videoId) {
      console.warn("optimizeVideo: could not parse video id from", objectName);
      return;
    }

    const db = getFirestore();
    const videoRef = db.collection(COLLECTIONS.videos).doc(videoId);
    const snap = await videoRef.get();
    if (!snap.exists) {
      console.warn("optimizeVideo: missing Firestore doc", videoId);
      return;
    }

    const bucket = getStorage().bucket(bucketName);
    const workDir = await fs.mkdtemp(join(tmpdir(), `video-${videoId}-`));
    const inputPath = join(workDir, "input");
    const outputPath = join(workDir, "output.mp4");
    const optimizedPath = `${VIDEO_OPTIMIZED_PREFIX}${videoId}.mp4`;

    try {
      await videoRef.set(
        {
          status: "processing",
          error: null,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      await bucket.file(objectName).download({ destination: inputPath });

      const ffmpegPath = getFfmpegPath();
      await execFileAsync(
        ffmpegPath,
        [
          "-y",
          "-i",
          inputPath,
          "-an",
          "-vf",
          "scale=1080:1080:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-profile:v",
          "high",
          "-level",
          "4.1",
          "-crf",
          "26",
          "-movflags",
          "+faststart",
          outputPath,
        ],
        { maxBuffer: 10 * 1024 * 1024 },
      );

      const outputBuffer = await fs.readFile(outputPath);
      const optimizedFile = bucket.file(optimizedPath);
      await optimizedFile.save(outputBuffer, {
        metadata: { contentType: "video/mp4", cacheControl: "public,max-age=31536000" },
        resumable: false,
        public: true,
      });

      const url = `https://storage.googleapis.com/${bucketName}/${optimizedPath}`;
      await videoRef.set(
        {
          url,
          optimizedPath,
          status: "ready",
          error: null,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      try {
        await bucket.file(objectName).delete({ ignoreNotFound: true });
      } catch (deleteErr) {
        console.warn("optimizeVideo: failed to delete original", objectName, deleteErr);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Video optimization failed";
      console.error("optimizeVideo failed", videoId, err);
      await videoRef.set(
        {
          status: "failed",
          error: message.slice(0, 500),
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } finally {
      await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  },
);
