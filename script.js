// ================= FIREBASE IMPORT =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= CONFIG (JANGAN UBAH PUNYAMU) =================
const firebaseConfig = {
  apiKey: "AIzaSyCxzqdHlEFi5lIuen7vW9u2cxNbe3mPiio",
  authDomain: "pony-ata.firebaseapp.com",
  projectId: "pony-ata"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const commentsRef = collection(db, "messages");

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  const commentsDiv = document.getElementById("comments");
  const sendBtn = document.getElementById("sendBtn");
  const counter = document.getElementById("counter");
  const nameInput = document.getElementById("nameInput");
  const githubInput = document.getElementById("githubInput");

  const MAX_CHAR = 300;

  // ================= QUILL INIT =================
  const quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Tulis pesan anonim...",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "bullet" }],
        ["clean"]
      ]
    }
  });

  // ================= CHARACTER COUNTER =================
  quill.on("text-change", () => {
    let length = quill.getLength() - 1;

    if (length > MAX_CHAR) {
      quill.deleteText(MAX_CHAR, quill.getLength());
      length = MAX_CHAR;
    }

    counter.textContent = `${length} / ${MAX_CHAR}`;
  });

  // ================= HELPERS =================
  function getAnonName() {
    const value = nameInput.value.trim();
    if (value) return value;

    const fallback = [
      "Anon Pony",
      "Anon Fox",
      "Anon Ghost",
      "Anon Star",
      "Anon Cat"
    ];

    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  function getGithubLink() {
    const value = githubInput.value.trim();
    if (!value) return null;

    if (!value.startsWith("http")) {
      return `https://github.com/${value}`;
    }

    return value;
  }

  // ================= SEND MESSAGE =================
  async function sendMessage() {
    const text = quill.getText().trim();

    if (!text) {
      alert("Empty message.");
      return;
    }

    if (text.length > MAX_CHAR) {
      alert(`Max ${MAX_CHAR} characters.`);
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = "Transmitting...";

    try {
      await addDoc(commentsRef, {
        name: getAnonName(),
        github: getGithubLink(),
        content: quill.root.innerHTML,
        createdAt: new Date() // stabil, bukan serverTimestamp
      });

      quill.setText("");
      nameInput.value = "";
      githubInput.value = "";

      sendBtn.textContent = "Transmission Sent";
      setTimeout(() => {
        sendBtn.textContent = "Kirim";
      }, 1200);

    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
      sendBtn.textContent = "Kirim";
    }

    sendBtn.disabled = false;
  }

  // Pasang event listener
  sendBtn.addEventListener("click", sendMessage);

  // ================= REALTIME LISTENER =================
  const q = query(
    commentsRef,
    orderBy("createdAt", "desc"),
    limit(20)
  );

  onSnapshot(q, (snapshot) => {
    commentsDiv.innerHTML = "";

    snapshot.forEach((doc) => {
      const d = doc.data();

      const el = document.createElement("div");
      el.className = "comment";

      el.innerHTML = `
        <span class="anon">${d.name || "Anon"}</span>
        ${
          d.github
            ? `<a class="github" href="${d.github}" target="_blank">GitHub</a>`
            : ""
        }
        <div class="content">${d.content}</div>
        <small>${new Date(d.createdAt).toLocaleString()}</small>
      `;

      commentsDiv.appendChild(el);
    });
  });

});