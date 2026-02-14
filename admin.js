// ==========================
// FIREBASE IMPORT
// ==========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

// ==========================
// LOGIN MAGIC LINK
// ==========================

const emailInput = document.getElementById("emailInput");
const sendLinkBtn = document.getElementById("sendLinkBtn");
const loginBox = document.getElementById("loginBox");
const adminBox = document.getElementById("adminBox");
const logoutBtn = document.getElementById("logoutBtn");

sendLinkBtn.addEventListener("click", async () => {
  const email = emailInput.value;

  const actionCodeSettings = {
    url: window.location.href,
    handleCodeInApp: true
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  localStorage.setItem("emailForSignIn", email);
  alert("Magic link terkirim 📩");
});

// ==========================
// HANDLE LOGIN LINK
// ==========================

if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = localStorage.getItem("emailForSignIn");
  if (!email) {
    email = prompt("Masukkan email untuk konfirmasi");
  }

  signInWithEmailLink(auth, email, window.location.href)
    .then(() => {
      localStorage.removeItem("emailForSignIn");
    });
}

// ==========================
// AUTH STATE
// ==========================

onAuthStateChanged(auth, user => {
  if (user) {
    loginBox.hidden = true;
    adminBox.hidden = false;
  } else {
    loginBox.hidden = false;
    adminBox.hidden = true;
  }
});

// ==========================
// LOGOUT
// ==========================

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// ==========================
// EDITOR + PICMO
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  const messagesDiv = document.getElementById("messages");
  const template = document.getElementById("editorTemplate");

  createMessageCard("Pesan user muncul di sini 👀");

  function createMessageCard(userText) {
    const wrapper = document.createElement("div");
    wrapper.className = "message";

    const userMsg = document.createElement("div");
    userMsg.className = "user-text";
    userMsg.textContent = userText;

    wrapper.appendChild(userMsg);

    const editorClone = template.content.cloneNode(true);
    wrapper.appendChild(editorClone);

    messagesDiv.appendChild(wrapper);

    setupEditor(wrapper);
  }

  function setupEditor(wrapper) {
    const editorArea = wrapper.querySelector(".editor-area");
    const buttons = wrapper.querySelectorAll("[data-cmd]");
    const emojiBtn = wrapper.querySelector(".emoji-btn");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const cmd = btn.getAttribute("data-cmd");
        document.execCommand(cmd);
        editorArea.focus();
      });
    });

    if (window.PicmoPopupPicker) {
      const picker = new window.PicmoPopupPicker.PopupPicker({
        referenceElement: emojiBtn
      });

      picker.addEventListener("emoji:select", event => {
        document.execCommand("insertText", false, event.emoji);
      });
    }
  }

});
