import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getClientStorage } from "./client";

const IMAGE_MAX = 5 * 1024 * 1024;
const VIDEO_MAX = 50 * 1024 * 1024;

function imageExt(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}

function resolveVideoExtension(fileName: string, contentType: string): string {
  const extFromName = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : null;
  if (extFromName && /^[a-z0-9]{2,5}$/.test(extFromName)) return extFromName;
  if (contentType === "video/quicktime") return "mov";
  if (contentType === "video/webm") return "webm";
  return "mp4";
}

export function resolveVideoObjectPath(videoId: string, fileName: string, contentType: string): string {
  const ext = resolveVideoExtension(fileName, contentType || "video/mp4");
  return `restro/videos/originals/${videoId}.${ext}`;
}

export function assertVideoUploadMeta(contentType: string, fileSize: number) {
  if (!contentType.startsWith("video/")) {
    throw new Error("Invalid file type. Please upload a video file.");
  }
  if (fileSize <= 0 || fileSize > VIDEO_MAX) {
    throw new Error("File too large. Maximum size is 50MB");
  }
}

export async function uploadImage(file: File, folder = "restro"): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP, AVIF");
  }
  if (file.size > IMAGE_MAX) {
    throw new Error("File too large. Maximum size is 5MB");
  }

  const path = `${folder}/${crypto.randomUUID()}.${imageExt(file.type)}`;
  const storageRef = ref(getClientStorage(), path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadVideoFile(file: File, videoId: string): Promise<{ path: string; contentType: string }> {
  assertVideoUploadMeta(file.type || "video/mp4", file.size);
  const contentType = file.type || "video/mp4";
  const path = resolveVideoObjectPath(videoId, file.name, contentType);
  const storageRef = ref(getClientStorage(), path);
  await uploadBytes(storageRef, file, { contentType });
  return { path, contentType };
}

export async function deleteStoragePath(path: string | null | undefined) {
  if (!path) return;
  try {
    await deleteObject(ref(getClientStorage(), path));
  } catch {
    // ignore missing files
  }
}
