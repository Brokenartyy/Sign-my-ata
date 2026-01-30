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
    console.error("SEND LINK ERROR:", err.code, err.message);
    alert("❌ Gagal kirim magic link: " + err.code);
  }
};

/* ================= CONFIRM MAGIC LINK ================= */
if (isSignInWithEmailLink(auth, window.location.href)) {
  const email = localStorage.getItem("adminEmail");

  if (!email) {
    alert("Email admin tidak ditemukan 😭");
  } else {
    signInWithEmailLink(auth, email, window.location.href)
      .then(() => localStorage.removeItem("adminEmail"))
      .catch(err => {
        console.error(err);
        alert("❌ Magic link invalid / expired");
      });
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
      const box = document.createElement("div");
      box.className = "admin-card";

const template = document.getElementById("editorTemplate");
const editor = template.content.cloneNode(true);

const editorArea = editor.querySelector(".editor-area");
editorArea.innerHTML = data.reply?.text || "";

editor.querySelectorAll("[data-cmd]").forEach(btn => {
  btn.onclick = () => {
    document.execCommand(btn.dataset.cmd, false, null);
  };
});

editor.querySelector("[data-link]").onclick = () => {
  const url = prompt("Masukkan URL:");
  if (url) document.execCommand("createLink", false, url);
};

box.appendChild(editor);

const replyBtn = document.createElement("button");
replyBtn.textContent = "Reply";

replyBtn.onclick = async () => {
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
