import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxzqdHlEFi5lIuen7vW9u2cxNbe3mPiio",
  authDomain: "pony-ata.firebaseapp.com",
  projectId: "pony-ata",
  storageBucket: "pony-ata.firebasestorage.app",
  messagingSenderId: "885964673100",
  appId: "1:885964673100:web:038c51f39b2a27278aa4e9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const adminDiv = document.getElementById("adminComments");
const commentsRef = collection(db, "messages");

const q = query(commentsRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snap) => {
  adminDiv.innerHTML = "";

  snap.forEach((docSnap) => {
    const d = docSnap.data();

    const box = document.createElement("div");
    box.innerHTML = `
      <p><strong>${d.name || "Anon"}</strong></p>
      ${d.content}
      <textarea placeholder="Balas admin..."></textarea>
      <button>Balas</button>
      <hr>
    `;

    const textarea = box.querySelector("textarea");
    const btn = box.querySelector("button");

    btn.onclick = async () => {
      if (!textarea.value.trim()) return;

      await updateDoc(doc(db, "messages", docSnap.id), {
        reply: {
          text: textarea.value,
          time: new Date()
        }
      });

      textarea.value = "";
    };

    adminDiv.appendChild(box);
  });
});
