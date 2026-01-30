// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= CONFIG ================= */
export const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID"
};

/* ================= INIT APP ================= */
export const app = initializeApp(firebaseConfig);

/* ================= AUTH ================= */
export const auth = getAuth(app);

// biar login nempel (magic link gak ilang)
setPersistence(auth, browserLocalPersistence)
  .catch(console.error);

/* ================= FIRESTORE ================= */
export const db = getFirestore(app);