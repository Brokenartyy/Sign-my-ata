import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxzqdHlEFi5lIuen7vW9u2cxNbe3mPiio",
  authDomain: "pony-ata.firebaseapp.com",
  projectId: "pony-ata"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const loginBox = document.getElementById("loginBox");
const adminBox = document.getElementById("adminBox");
const messagesDiv = document.getElementById("messages");

const emailInput = document.getElementById("emailInput");
const sendLinkBtn = document.getElementById("sendLinkBtn");
const logoutBtn = document.getElementById("logoutBtn");

import {
  onAuthStateChanged,
  signOut,
  sendSignInLinkToEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* ================= LOGIN ================= */

sendLinkBtn.onclick = async () => {
  const email = emailInput.value;
  if (!email) return alert("Email kosong");

  await sendSignInLinkToEmail(auth, email, {
    url: window.location.href,
    handleCodeInApp: true
  });

  alert("Magic link dikirim 💌");
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    loginBox.hidden = true;
    adminBox.hidden = false;
    loadMessages();
  } else {
    loginBox.hidden = false;
    adminBox.hidden = true;
  }
});

/* ================= EMOJI PICKER ================= */

const picker = new window.PicmoPopupPicker.PopupPicker({
  autoHide: true
});

let activeEditor = null;

picker.addEventListener("emoji:select", e => {
  if (!activeEditor) return;
  document.execCommand("insertText", false, e.emoji);
});

/* ================= LOAD MESSAGES ================= */

function loadMessages() {
  const q = query(
    collection(db, "messages"),
    orderBy("createdAt", "asc")
  );

  onSnapshot(q, snap => {
    messagesDiv.innerHTML = "";

    snap.forEach(doc => {
      const data = doc.data();

      const msgBox = document.createElement("div");
      msgBox.className = "message";

      msgBox.innerHTML = `
        <p><b>User:</b> ${data.text}</p>
      `;

      // ===== CLONE EDITOR =====
      const template = document.getElementById("editorTemplate");
      const editorClone = template.content.cloneNode(true);

      const editor = editorClone.querySelector(".editor");
      const editorArea = editorClone.querySelector(".editor-area");
      const emojiBtn = editorClone.querySelector(".emoji-btn");
      const sendBtn = editorClone.querySelector(".send-reply");

      // toolbar formatting
      editorClone.querySelectorAll("[data-cmd]").forEach(btn => {
        btn.onclick = () => {
          document.execCommand(btn.dataset.cmd, false, null);
        };
      });

      emojiBtn.onclick = e => {
        activeEditor = editorArea;
        picker.toggle(e.target);
      };

      sendBtn.onclick = async () => {
        if (!editorArea.innerHTML.trim()) return;

        await addDoc(
          collection(db, "messages", doc.id, "replies"),
          {
            text: editorArea.innerHTML,
            createdAt: serverTimestamp(),
            admin: true
          }
        );

        editorArea.innerHTML = "";
      };

      msgBox.appendChild(editorClone);
      messagesDiv.appendChild(msgBox);
    });
  });
}
