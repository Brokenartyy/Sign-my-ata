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

      /* ===== ADMIN REPLY CHAR COUNTER ===== */
const ADMIN_REPLY_LIMIT = 300;

const counter = document.createElement("div");
counter.textContent = "0/" + ADMIN_REPLY_LIMIT;
counter.style.fontSize = "12px";
counter.style.opacity = "0.7";
counter.style.marginTop = "4px";

function updateCounter() {
  const length = editorArea.innerText.length;
  counter.textContent = `${length}/${ADMIN_REPLY_LIMIT}`;

  if (length > ADMIN_REPLY_LIMIT) {
    counter.style.color = "red";
  } else {
    counter.style.color = "";
  }
}

editorArea.addEventListener("input", () => {
  if (editorArea.innerText.length > ADMIN_REPLY_LIMIT) {
    editorArea.innerText = editorArea.innerText.slice(0, ADMIN_REPLY_LIMIT);
  }
  updateCounter();
});

editorArea.after(counter);
updateCounter();

  editor.querySelectorAll("[data-cmd]").forEach((btn) => {
  btn.onclick = () => {
    editorArea.focus();

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    document.execCommand(btn.dataset.cmd);
  };
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
