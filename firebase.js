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
  apiKey: "AIzaSyCxzqdHlEFi5lIuen7vW9u2cxNbe3mPiio",
  authDomain: "pony-ata.firebaseapp.com",
  projectId: "pony-ata"
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