/* ===============================
   PICMO ADMIN STATE
================================ */
let activeEditorArea = null;
let savedRange = null;

const picker = new window.PicmoPopupPicker.PopupPicker({
  showSearch: true,
  showPreview: false,
  autoHide: true
});

picker.addEventListener("emoji:select", e => {
  insertEmoji(e.emoji);
});

/* ================= IMPORT ================= */
import { auth, db } from "./firebase.js";

import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= ELEMENT ================= */
const sendLinkBtn = document.getElementById("sendLinkBtn");
const emailInput  = document.getElementById("emailInput");
const loginBox    = document.getElementById("loginBox");
const adminBox    = document.getElementById("adminBox");
const messages    = document.getElementById("messages");
const title       = document.getElementById("title");
const logoutBtn   = document.getElementById("logoutBtn");

/* ================= SEND MAGIC LINK ================= */
sendLinkBtn.onclick = async () => {
  const email = emailInput.value.trim();
  if (!email) {
    alert("Email kosong 🗿");
    return;
  }

  const actionCodeSettings = {
    url: "https://brokenartyy.github.io/Sign-my-ata/admin.html",
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("adminEmail", email);
    alert("📩 Magic link terkirim! Cek inbox / spam ✨");
  } catch (err) {
    console.error(err);
    alert("❌ Gagal kirim magic link");
  }
};

/* ================= CONFIRM MAGIC LINK ================= */
if (isSignInWithEmailLink(auth, window.location.href)) {
  const email = localStorage.getItem("adminEmail");

  if (email) {
    signInWithEmailLink(auth, email, window.location.href)
      .then(() => localStorage.removeItem("adminEmail"))
      .catch(() => alert("❌ Magic link invalid / expired"));
  }
}

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    loginBox.hidden = false;
    adminBox.hidden = true;
    title.textContent = "🔒 Admin Login";
    return;
  }

  loginBox.hidden = true;
  adminBox.hidden = false;
  title.textContent = "👑 Admin Panel";

  const q = query(
    collection(db, "messages"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snap) => {
    messages.innerHTML = "";

    snap.forEach((docSnap) => {
      const data = docSnap.data();

      /* ===== CARD ===== */
      const box = document.createElement("div");
      box.className = "admin-card";

      /* ===== VISITOR MESSAGE ===== */
      const visitorMsg = document.createElement("div");
      visitorMsg.className = "visitor-message";
      visitorMsg.innerHTML = `
        <b>${data.name}</b>
        <p>${data.content}</p>
      `;
      box.appendChild(visitorMsg);

      /* ===== EDITOR ===== */
      const template = document.getElementById("editorTemplate");
      const editor = template.content.cloneNode(true);
      const editorArea = editor.querySelector(".editor-area");

      editorArea.setAttribute("contenteditable", "true");
      editorArea.innerHTML = data.reply?.text || "";
      editorArea.innerHTML ||= "<p><br></p>";

      editorArea.addEventListener("focus", () => {
  activeEditorArea = editorArea;
});

editorArea.addEventListener("keyup", saveSelection);
editorArea.addEventListener("mouseup", saveSelection);

function saveSelection() {
  const sel = window.getSelection();
  if (!sel.rangeCount || !activeEditorArea) return;

  const range = sel.getRangeAt(0);
  if (activeEditorArea.contains(range.startContainer)) {
    savedRange = range;
  }
}

const emojiBtn = editor.querySelector(".emoji-btn");

emojiBtn.addEventListener("click", (e) => {
  e.preventDefault();
  editorArea.focus();

  if (savedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  picker.toggle(emojiBtn);
});

function insertEmoji(emojiChar) {
  if (!savedRange || !activeEditorArea) return;

  const range = savedRange;
  range.deleteContents();

  const textNode = document.createTextNode(emojiChar);
  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.collapse(true);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  savedRange = range;
}

      /* ===== ADMIN REPLY CHAR COUNTER ===== */
function getPlainTextLength(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText.length;
}

editorArea.addEventListener("input", () => {
  const length = getPlainTextLength(editorArea.innerHTML);

  if (length > ADMIN_REPLY_LIMIT) {
    editorArea.innerHTML = editorArea.innerHTML.slice(0, ADMIN_REPLY_LIMIT);
  }

  counter.textContent = `${length}/${ADMIN_REPLY_LIMIT}`;
  counter.style.color = length > ADMIN_REPLY_LIMIT ? "red" : "";
});


      const linkBtn = editor.querySelector("[data-link]");
      if (linkBtn) {
        linkBtn.onclick = () => {
          const url = prompt("Masukkan URL:");
          if (url) {
            editorArea.focus();
            document.execCommand("createLink", false, url);
          }
        };
      }

      box.appendChild(editor);

      /* ===== REPLY BUTTON ===== */
      const replyBtn = document.createElement("button");
      replyBtn.textContent = "Reply";

      replyBtn.onclick = async () => {
        if (!editorArea.innerText.trim()) {
          alert("Balasan masih kosong 🗿");
          return;
        }

        try {
          await updateDoc(doc(db, "messages", docSnap.id), {
            reply: {
              text: editorArea.innerHTML,
              at: serverTimestamp()
            }
          });
        } catch (err) {
          console.error(err);
          alert("❌ Gagal reply");
        }
      };

      box.appendChild(replyBtn);
      messages.appendChild(box);
    });
  });
});

/* ================= LOGOUT ================= */
logoutBtn.onclick = () => signOut(auth);
