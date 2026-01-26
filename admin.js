const sendLinkBtn = document.getElementById("sendLinkBtn");
const emailInput = document.getElementById("emailInput");

/* ================= CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCxzqdHlEFi5lIuen7vW9u2cxNbe3mPiio",
  authDomain: "pony-ata.firebaseapp.com",
  projectId: "pony-ata"
};

/* ================= INIT ================= */
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.log("Doc user belum ada");
    return;
  }

  if (snap.data().role === "admin") {
    document.body.classList.add("is-admin");
  }
});

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
    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
    localStorage.setItem("adminEmail", email);
    alert("📩 Magic link terkirim! Cek inbox / spam ✨");
  } catch (err) {
    console.error("SEND LINK ERROR:", err.code, err.message);
    alert("❌ Gagal kirim magic link: " + err.code);
  }
};


/* ================= CONFIRM MAGIC LINK ================= */
if (auth.isSignInWithEmailLink(window.location.href)) {
  const email = localStorage.getItem("adminEmail");

  if (!email) {
    alert("Email admin tidak ditemukan 😭");
  } else {
    auth.signInWithEmailLink(email, window.location.href)
      .then(() => localStorage.removeItem("adminEmail"))
      .catch(err => {
        console.error(err);
        alert("❌ Magic link invalid / expired");
      });
  }
}

/* ================= AUTH STATE ================= */
auth.onAuthStateChanged(user => {
  if (!user) {
    loginBox.hidden = false;
    adminBox.hidden = true;
    title.textContent = "🔒 Admin Login";
    return;
  }

  loginBox.hidden = true;
  adminBox.hidden = false;
  title.textContent = "👑 Admin Panel";

  db.collection("messages")
    .orderBy("createdAt", "desc")
    .onSnapshot(snap => {
      messages.innerHTML = "";

      snap.forEach(docSnap => {
        const data = docSnap.data();
        const box = document.createElement("div");
        box.className = "admin-card";

        box.innerHTML = `
          <b>${data.name}</b>
          <p>${data.content}</p>
          <textarea placeholder="Balasan admin...">${data.reply?.text || ""}</textarea>
          <button>Reply</button>
        `;

        box.querySelector("button").onclick = async () => {
          try {
            await db.collection("messages").doc(docSnap.id).update({
              reply: {
                text: box.querySelector("textarea").value,
                at: firebase.firestore.FieldValue.serverTimestamp()
              }
            });
          } catch (err) {
            console.error(err);
            alert("❌ Gagal reply (cek rules / admin claim)");
          }
        };

        messages.appendChild(box);
      });
    });
});

/* ================= LOGOUT ================= */
logoutBtn.onclick = () => auth.signOut();

