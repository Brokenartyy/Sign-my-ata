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
  projectId: "pony-ata"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const commentsRef = collection(db, "messages");
const adminDiv = document.getElementById("adminComments");

const q = query(commentsRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  adminDiv.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();

    const box = document.createElement("div");
    box.style.border = "1px solid #ccc";
    box.style.padding = "10px";
    box.style.marginBottom = "10px";

    box.innerHTML = `
      <strong>${d.name}</strong>
      ${d.content}
      <textarea placeholder="Balas sebagai admin..."></textarea>
      <button>Balas</button>
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

