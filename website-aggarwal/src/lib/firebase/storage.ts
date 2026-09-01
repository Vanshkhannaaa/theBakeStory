import { adminStorage } from "./admin";
import sharp from "sharp";
import { randomUUID } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadImage(file: File, folder = "restro"): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP, AVIF");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Maximum size is 5MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(buffer)
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `${folder}/${randomUUID()}.webp`;
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filename);

  await fileRef.save(webpBuffer, {
    metadata: { contentType: "image/webp" },
    public: true,
  });

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

export async function deleteImage(imageUrl: string | null | undefined) {
  if (!imageUrl) return;
  try {
    const bucket = adminStorage.bucket();
    const match = imageUrl.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/);
    if (match) {
      await bucket.file(match[1]).delete();
    }
  } catch {
    // file may not exist
  }
}
