import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";
import { loadServiceAccount } from "./credentials";

function isValidServiceAccount(account: ServiceAccount): boolean {
  const raw = account as ServiceAccount & {
    project_id?: string;
    private_key?: string;
    client_email?: string;
  };
  const projectId = account.projectId ?? raw.project_id;
  const privateKey = account.privateKey ?? raw.private_key;
  const clientEmail = account.clientEmail ?? raw.client_email;
  return (
    typeof projectId === "string" &&
    typeof privateKey === "string" &&
    typeof clientEmail === "string"
  );
}

function initAdmin(): App {
  if (getApps().length > 0) return getApps()[0]!;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    "aggarwal-sweets-d2a16";
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const serviceAccount = loadServiceAccount();

  if (serviceAccount && isValidServiceAccount(serviceAccount)) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId,
      storageBucket,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket,
  });
}

let app: App | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: Storage | undefined;

function getApp(): App {
  if (!app) app = initAdmin();
  return app;
}

function getAdminDb(): Firestore {
  if (!db) db = getFirestore(getApp());
  return db;
}

function getAdminAuth(): Auth {
  if (!auth) auth = getAuth(getApp());
  return auth;
}

function getAdminStorage(): Storage {
  if (!storage) storage = getStorage(getApp());
  return storage;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    const firestore = getAdminDb();
    const value = Reflect.get(firestore as object, prop, receiver);
    return typeof value === "function" ? value.bind(firestore) : value;
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    const admin = getAdminAuth();
    const value = Reflect.get(admin as object, prop, receiver);
    return typeof value === "function" ? value.bind(admin) : value;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_target, prop, receiver) {
    const bucket = getAdminStorage();
    const value = Reflect.get(bucket as object, prop, receiver);
    return typeof value === "function" ? value.bind(bucket) : value;
  },
});
