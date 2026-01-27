
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

  // ================= QUILL (GLOBAL) =================
  window.quill = new Quill("#editor", {
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

  // ================= COUNTER =================
  window.quill.on("text-change", () => {
    const length = window.quill.getText().trim().length;
    counter.textContent = `${length} karakter`;
  });

  const MAX_CHAR = 10000;

window.quill.on("text-change", () => {
  const length = window.quill.getLength();

  if (length > MAX_CHAR) {
    window.quill.deleteText(MAX_CHAR, length);
  }

  counter.textContent = `${length - 1} / ${MAX_CHAR}`;
});
  

  // ================= RANDOM ANON =================
  const nameInput = document.getElementById("nameInput");

function getAnonName() {
  const value = nameInput.value.trim();

  if (value.length === 0) {
    const fallback = [
      "Anon Pony",
      "Anon Fox",
      "Anon Ghost",
      "Anon Star",
      "Anon Cat"
    ];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return value;
}

  // ================= GITHUB LINK =================
  const githubInput = document.getElementById("githubInput");

function getGithubLink() {
  const value = githubInput.value.trim();

  if (!value) return null;

  // auto rapihin kalau user cuma nulis username
  if (!value.startsWith("http")) {
    return `https://github.com/${value}`;
  }

  return value;
}
  
  // ================= SEND MESSAGE =================
  window.sendMessage = async function () {
    window.quill.blur();

    const text = window.quill.getText().trim();
    if (!text) {
      alert("Pesan kosong 😭");
      return;
    }

    if (text.length > MAX_CHAR) {
  alert("Kepanjangan 😭 maksimal 10.000 karakter");
  return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = "Mengirim...";

    try {
    await addDoc(commentsRef, {
    name: getAnonName(),
    github: getGithubLink(), // 👈 BARU
    content: window.quill.root.innerHTML,
    createdAt: serverTimestamp()
  });


      window.quill.setText("");
      githubInput.value = "";
      
    } catch (err) {
      alert("Gagal kirim pesan 😭");
      console.error(err);
    }

    sendBtn.disabled = false;
    sendBtn.textContent = "Kirim";
  };

  // ================= REALTIME LISTENER =================
  const q = query(
    commentsRef,
    orderBy("createdAt", "desc"),
    limit(20) // biar gak berat
  );

  onSnapshot(q, (snapshot) => {
    // hapus loading halaman (kalau ada)
    document.getElementById("loading")?.remove();

    commentsDiv.innerHTML = "";

    snapshot.forEach((doc) => {
      const d = doc.data();
      const el = document.createElement("div");
      el.className = "comment";
      el.innerHTML = `
  <span class="anon">${d.name || "Anon"}</span>
  ${d.github ? `<a class="github" href="${d.github}" target="_blank">GitHub</a>` : ""}
  ${d.content}

  ${
    d.reply
      ? `<div class="reply">
           <strong>Nanaa</strong>
           ${d.reply.text}
         </div>`
      : ""
  }

  <small>${d.createdAt?.toDate()?.toLocaleString() || "baru saja"}</small>
`;


      commentsDiv.appendChild(el);
    });
  });
