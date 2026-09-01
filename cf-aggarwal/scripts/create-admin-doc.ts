/**
 * Bootstrap script: creates admins/{uid} doc for the Firebase Auth user.
 * Run: node --import tsx scripts/create-admin-doc.ts
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDMGWSkho_AG8D0UA1G18pBtrLiUd4-cwM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "aggarwal-sweets-d2a16.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "aggarwal-sweets-d2a16",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "aggarwal-sweets-d2a16.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "835172120933",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:835172120933:web:cc8c027d61100a5b17498c",
};

const EMAIL = "admin@aggarwalsweets.com";
const PASSWORD = "admin@123";
const UID = "gw8HPILnl7OyRxhrs6V7otuDzle2";

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const credential = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
  const uid = credential.user.uid;
  console.log("Signed in as:", uid);

  await setDoc(doc(db, "admins", uid), {
    name: "Super Admin",
    email: EMAIL,
    password: PASSWORD,
    role: "SUPER_ADMIN",
    active: true,
    createDate: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log("Created admins/" + uid);
}

main().catch(console.error);
