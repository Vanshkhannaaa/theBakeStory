import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { ServiceAccount } from "firebase-admin/app";

let cached: ServiceAccount | null | undefined;

export function loadServiceAccount(): ServiceAccount | null {
  if (cached !== undefined) return cached;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount & {
        project_id?: string;
        private_key?: string;
        client_email?: string;
      };
      const projectId = parsed.projectId ?? parsed.project_id;
      const privateKey = parsed.privateKey ?? parsed.private_key;
      const clientEmail = parsed.clientEmail ?? parsed.client_email;
      if (projectId && privateKey && clientEmail) {
        cached = parsed;
        return cached;
      }
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON");
    }
  }

  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    join(process.cwd(), "service-account.json"),
    join(process.cwd(), "../admin-aggarwal/service-account.json"),
  ].filter(Boolean) as string[];

  for (const path of candidates) {
    if (existsSync(path)) {
      cached = JSON.parse(readFileSync(path, "utf8")) as ServiceAccount;
      return cached;
    }
  }

  cached = null;
  return null;
}

export function hasServiceAccount(): boolean {
  return loadServiceAccount() !== null;
}
