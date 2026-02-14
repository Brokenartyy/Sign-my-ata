// ==========================
// FIREBASE IMPORT (VERSI SAMA SEMUA)
// ==========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ==========================
// FIREBASE CONFIG
// ==========================

const firebaseConfig = {
  apiKey: "AIzaSyCxzqdHlEFi5lIuen7vW9u2cxNbe3mPiio",
  authDomain: "pony-ata.firebaseapp.com",
  projectId: "pony-ata",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const commentsRef = collection(db, "messages");


// ==========================
// SEMUA DOM JALAN SETELAH SIAP
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  const emailInput = document.getElementById("emailInput");
  const sendLinkBtn = document.getElementById("sendLinkBtn");
  const loginBox = document.getElementById("loginBox");
  const adminBox = document.getElementById("adminBox");
  const logoutBtn = document.getElementById("logoutBtn");
  const messagesDiv = document.getElementById("messages");
  const template = document.getElementById("editorTemplate");

  let unsubscribe = null;

  // ================= LOGIN MAGIC LINK =================

  sendLinkBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return alert("Isi email dulu 😭");

    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("emailForSignIn", email);
    alert("Magic link terkirim 📩");
  });

  // ================= HANDLE LOGIN LINK =================

  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = localStorage.getItem("emailForSignIn");
    if (!email) email = prompt("Masukkan email untuk konfirmasi");

    signInWithEmailLink(auth, email, window.location.href)
      .then(() => localStorage.removeItem("emailForSignIn"));
  }

  // ================= AUTH STATE =================

  onAuthStateChanged(auth, (user) => {

    if (user) {
      loginBox.hidden = true;
      adminBox.hidden = false;

      startFirestoreListener(); // 🔥 baru dengarkan DB setelah login
    } else {
      loginBox.hidden = false;
      adminBox.hidden = true;

      if (unsubscribe) unsubscribe(); // stop listener kalau logout
    }
  });

  // ================= LOGOUT =================

  logoutBtn.addEventListener("click", () => {
    signOut(auth);
  });


  // ================= FIRESTORE LISTENER =================

  function startFirestoreListener() {

    const q = query(
      commentsRef,
      orderBy("createdAt", "desc")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {

      messagesDiv.innerHTML = "";

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        createMessageCard(docSnap.id, data);
      });

    });
  }


  // ================= BUAT CARD =================

  function createMessageCard(docId, data) {

    const wrapper = document.createElement("div");
    wrapper.className = "message";

    const userMsg = document.createElement("div");
    userMsg.className = "user-text";

    userMsg.innerHTML = `
      <strong>${data.name || "Anon"}</strong>
      ${data.github ? `<a href="${data.github}" target="_blank">GitHub</a>` : ""}
      ${data.content}
      ${
        data.reply
          ? `<div class="reply">
               <strong>Nanaa</strong>
               ${data.reply.text}
             </div>`
          : ""
      }
      <small>${data.createdAt?.toDate()?.toLocaleString() || "baru saja"}</small>
    `;

    wrapper.appendChild(userMsg);

    const editorClone = template.content.cloneNode(true);
    wrapper.appendChild(editorClone);

    messagesDiv.appendChild(wrapper);

    setupEditor(wrapper, docId);
  }


  // ================= REPLY SYSTEM =================

  function setupEditor(wrapper, docId) {

    const editorArea = wrapper.querySelector(".editor-area");
    const sendBtn = wrapper.querySelector(".send-reply");

    sendBtn.addEventListener("click", async () => {

      const replyText = editorArea.innerHTML.trim();
      if (!replyText) return;

      await updateDoc(doc(db, "messages", docId), {
        reply: {
          text: replyText
        }
      });

      editorArea.innerHTML = "";
    });

  }

});
