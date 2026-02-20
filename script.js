
  // ================= FIREBASE IMPORT =================
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    limit
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  // ================= CONFIG =================
  const firebaseConfig = {
    apiKey: "AIzaSyCxzqdHlEFi5lIuen7vW9u2cxNbe3mPiio",
    authDomain: "pony-ata.firebaseapp.com",
    projectId: "pony-ata"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const commentsRef = collection(db, "messages");

  // ================= DOM =================
const commentsDiv = document.getElementById("comments");
const sendBtn = document.getElementById("sendBtn");
const counter = document.getElementById("counter");
const nameInput = document.getElementById("nameInput");
const githubInput = document.getElementById("githubInput");

// ================= QUILL =================
const MAX_CHAR = 300;

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

// SINGLE listener only
quill.on("text-change", () => {
  let length = quill.getLength() - 1; // minus newline

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
window.sendMessage = async function () {
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
  sendBtn.textContent = "Sending...";

  try {
    await addDoc(commentsRef, {
      name: getAnonName(),
      github: getGithubLink(),
      content: quill.root.innerHTML,
      createdAt: serverTimestamp()
    });

    quill.setText("");
    nameInput.value = "";
    githubInput.value = "";

  } catch (err) {
    console.error(err);
    alert("Failed to send message.");
  }

  sendBtn.disabled = false;
  sendBtn.textContent = "Send";
};

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

    // skip kalau timestamp belum ready
    if (!d.createdAt) return;

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
      <small>${d.createdAt.toDate().toLocaleString()}</small>
    `;

    commentsDiv.appendChild(el);
  });
});