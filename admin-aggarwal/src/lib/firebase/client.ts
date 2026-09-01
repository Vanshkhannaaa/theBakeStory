import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getClientApp(): FirebaseApp {
  return getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
}

export const firebaseApp = typeof window !== "undefined" ? getClientApp() : null;

export function getClientAuth() {
  if (!firebaseApp) throw new Error("Firebase client not initialized");
  return getAuth(firebaseApp);
}

export function getClientDb() {
  if (!firebaseApp) throw new Error("Firebase client not initialized");
  return getFirestore(firebaseApp);
}

export function getClientStorage() {
  if (!firebaseApp) throw new Error("Firebase client not initialized");
  return getStorage(firebaseApp);
}
