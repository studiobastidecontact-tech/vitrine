import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const ALLOWED_EMAILS = [
  "ilan.chekroun1@gmail.com",
  "studiobastideform@gmail.com",
  "fournier.solal.pro@gmail.com",
  "maelarnaud.pro@gmail.com",
  "studiobastide.contact@gmail.com",
];

const firebaseConfig = {
  apiKey: "AIzaSyCvL0nNQf2eJIUTpExDj7GHv4c9gPHEl8M",
  authDomain: "studio-bastide-admin.firebaseapp.com",
  projectId: "studio-bastide-admin",
  storageBucket: "studio-bastide-admin.firebasestorage.app",
  messagingSenderId: "982414411603",
  appId: "1:982414411603:web:0fdd1d537b6781687803a6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── Refs DOM ──────────────────────────────────────────────────────────

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");
const userEmailSpan = document.getElementById("user-email");
const adminPanels = document.getElementById("admin-panels");
const authWarning = document.getElementById("auth-warning");
const authInfoPreLogin = document.getElementById("auth-info-pre-login");

const audioListEl = document.getElementById("audio-list");
const videoListEl = document.getElementById("video-list");
const logoListEl = document.getElementById("logo-list");

const audioForm = document.getElementById("audio-form");
const audioIdInput = document.getElementById("audio-id");
const audioTitleInput = document.getElementById("audio-title");
const audioFileUrlInput = document.getElementById("audio-fileUrl");
const audioOrderInput = document.getElementById("audio-order");
const audioResetBtn = document.getElementById("audio-reset-btn");
const audioSubmitBtn = audioForm.querySelector('button[type="submit"]');

const videoForm = document.getElementById("video-form");
const videoIdInput = document.getElementById("video-id");
const videoTitleInput = document.getElementById("video-title");
const videoAltInput = document.getElementById("video-alt");
const videoFileUrlInput = document.getElementById("video-fileUrl");
const videoYoutubeIdInput = document.getElementById("video-youtubeId");
const videoOrderInput = document.getElementById("video-order");
const videoResetBtn = document.getElementById("video-reset-btn");
const videoSubmitBtn = videoForm.querySelector('button[type="submit"]');

const logoForm = document.getElementById("logo-form");
const logoIdInput = document.getElementById("logo-id");
const logoAltInput = document.getElementById("logo-alt");
const logoFileUrlInput = document.getElementById("logo-fileUrl");
const logoOrderInput = document.getElementById("logo-order");
const logoResetBtn = document.getElementById("logo-reset-btn");
const logoSubmitBtn = logoForm.querySelector('button[type="submit"]');

// ── Toggle dark/light ─────────────────────────────────────────────────

const themeToggleBtn = document.getElementById("theme-toggle");
const iconSun = document.getElementById("icon-sun");
const iconMoon = document.getElementById("icon-moon");

function applyThemeIcons() {
  const isDark = document.documentElement.classList.contains("dark");
  iconSun.classList.toggle("hidden", !isDark);
  iconMoon.classList.toggle("hidden", isDark);
}

applyThemeIcons();

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("admin-theme", isDark ? "dark" : "light");
  applyThemeIcons();
});

// ── Auth ───────────────────────────────────────────────────────────────

function setAdminVisible(visible) {
  if (visible) {
    adminPanels.classList.remove("pointer-events-none", "opacity-0");
    adminPanels.classList.add("opacity-100");
  } else {
    adminPanels.classList.add("pointer-events-none", "opacity-0");
    adminPanels.classList.remove("opacity-100");
  }
}

function resetAudioForm() {
  audioIdInput.value = "";
  audioForm.reset();
  if (audioSubmitBtn) audioSubmitBtn.textContent = "Ajouter l'élément";
}

function resetVideoForm() {
  videoIdInput.value = "";
  videoForm.reset();
  if (videoSubmitBtn) videoSubmitBtn.textContent = "Ajouter l'élément";
}

function resetLogoForm() {
  logoIdInput.value = "";
  logoForm.reset();
  if (logoSubmitBtn) logoSubmitBtn.textContent = "Ajouter l'élément";
}

loginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Erreur de connexion:", error);
    alert("Connexion Google impossible. Réessaie plus tard.");
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    userInfo.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    authWarning.classList.add("hidden");
    authInfoPreLogin.classList.remove("hidden");
    setAdminVisible(false);
    return;
  }

  userEmailSpan.textContent = user.email || "";
  userInfo.classList.remove("hidden");
  userInfo.style.display = "flex";
  logoutBtn.classList.remove("hidden");
  loginBtn.classList.add("hidden");

  const isAllowed =
    user.email &&
    ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(
      user.email.toLowerCase(),
    );

  if (!isAllowed) {
    authWarning.classList.remove("hidden");
    setAdminVisible(false);
    return;
  }

  authWarning.classList.add("hidden");
  authInfoPreLogin.classList.add("hidden");
  setAdminVisible(true);

  await Promise.all([loadAudioTracks(), loadVideos(), loadLogos()]);
});

// ── Chargement des données ─────────────────────────────────────────────

function makeListItem(content) {
  const div = document.createElement("div");
  div.className = "admin-list-item";
  div.innerHTML = content;
  return div;
}

async function loadAudioTracks() {
  audioListEl.innerHTML =
    '<p class="admin-item-sub">Chargement des pistes...</p>';
  try {
    const q = query(collection(db, "audioTracks"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      audioListEl.innerHTML =
        '<p class="admin-item-sub" style="font-style:italic">Aucune piste pour l\'instant.</p>';
      return;
    }
    audioListEl.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const item = makeListItem(`
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px">
                  <span class="admin-order-badge">${data.order ?? "-"}</span>
                  <p class="admin-item-title">${data.title || "(sans titre)"}</p>
                </div>
                <p class="admin-item-sub">${data.fileUrl || ""}</p>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;margin-left:8px">
                <button type="button" class="admin-edit-btn" data-action="edit" data-id="${docSnap.id}">Modifier</button>
                <button type="button" class="admin-delete-btn" data-action="delete" data-id="${docSnap.id}">Supprimer</button>
              </div>
            `);
      audioListEl.appendChild(item);
    });
  } catch (error) {
    console.error("Erreur chargement audioTracks:", error);
    audioListEl.innerHTML =
      '<p style="font-size:0.75rem;color:#ef4444">Erreur lors du chargement des pistes.</p>';
  }
}

async function loadVideos() {
  videoListEl.innerHTML =
    '<p class="admin-item-sub">Chargement des vidéos...</p>';
  try {
    const q = query(collection(db, "videos"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      videoListEl.innerHTML =
        '<p class="admin-item-sub" style="font-style:italic">Aucune vidéo pour l\'instant.</p>';
      return;
    }
    videoListEl.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const ytWarning = data.youtubeId
        ? `<p class="admin-item-sub2">YT: ${data.youtubeId}</p>`
        : `<p style="font-size:11px;color:#f59e0b;margin-top:2px">⚠ Pas d'ID YouTube</p>`;
      const item = makeListItem(`
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px">
                  <span class="admin-order-badge">${data.order ?? "-"}</span>
                  <p class="admin-item-title">${data.title || "(sans titre)"}</p>
                </div>
                <p class="admin-item-sub">${data.alt || ""}</p>
                <p class="admin-item-sub2">${data.fileUrl || ""}</p>
                ${ytWarning}
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;margin-left:8px">
                <button type="button" class="admin-edit-btn" data-action="edit" data-id="${docSnap.id}">Modifier</button>
                <button type="button" class="admin-delete-btn" data-action="delete" data-id="${docSnap.id}">Supprimer</button>
              </div>
            `);
      videoListEl.appendChild(item);
    });
  } catch (error) {
    console.error("Erreur chargement vidéos:", error);
    videoListEl.innerHTML =
      '<p style="font-size:0.75rem;color:#ef4444">Erreur lors du chargement des vidéos.</p>';
  }
}

async function loadLogos() {
  logoListEl.innerHTML =
    '<p class="admin-item-sub">Chargement des logos...</p>';
  try {
    const q = query(collection(db, "trustedLogos"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      logoListEl.innerHTML =
        '<p class="admin-item-sub" style="font-style:italic">Aucun logo pour l\'instant.</p>';
      return;
    }
    logoListEl.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const item = makeListItem(`
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px">
                  <span class="admin-order-badge">${data.order ?? "-"}</span>
                  <p class="admin-item-title">${data.alt || "(sans nom)"}</p>
                </div>
                <p class="admin-item-sub">${data.fileUrl || ""}</p>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;margin-left:8px">
                <button type="button" class="admin-edit-btn" data-action="edit" data-id="${docSnap.id}">Modifier</button>
                <button type="button" class="admin-delete-btn" data-action="delete" data-id="${docSnap.id}">Supprimer</button>
              </div>
            `);
      logoListEl.appendChild(item);
    });
  } catch (error) {
    console.error("Erreur chargement logos:", error);
    logoListEl.innerHTML =
      '<p style="font-size:0.75rem;color:#ef4444">Erreur lors du chargement des logos.</p>';
  }
}

// ── Listeners édition / suppression ───────────────────────────────────

audioListEl.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "edit") {
    try {
      const snapshot = await getDocs(collection(db, "audioTracks"));
      const docSnap = snapshot.docs.find((d) => d.id === id);
      if (!docSnap) return;
      const data = docSnap.data();
      audioIdInput.value = docSnap.id;
      audioTitleInput.value = data.title || "";
      audioFileUrlInput.value = data.fileUrl || "";
      audioOrderInput.value = data.order ?? "";
      if (audioSubmitBtn) audioSubmitBtn.textContent = "Mettre à jour";
    } catch (error) {
      console.error("Erreur chargement piste:", error);
    }
  } else if (action === "delete") {
    if (!confirm("Supprimer définitivement cette piste ?")) return;
    try {
      await deleteDoc(doc(db, "audioTracks", id));
      await loadAudioTracks();
      resetAudioForm();
    } catch (error) {
      console.error("Erreur suppression piste:", error);
      alert("Impossible de supprimer cette piste.");
    }
  }
});

videoListEl.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "edit") {
    try {
      const snapshot = await getDocs(collection(db, "videos"));
      const docSnap = snapshot.docs.find((d) => d.id === id);
      if (!docSnap) return;
      const data = docSnap.data();
      videoIdInput.value = docSnap.id;
      videoTitleInput.value = data.title || "";
      videoAltInput.value = data.alt || "";
      videoFileUrlInput.value = data.fileUrl || "";
      videoYoutubeIdInput.value = data.youtubeId || "";
      videoOrderInput.value = data.order ?? "";
      if (videoSubmitBtn) videoSubmitBtn.textContent = "Mettre à jour";
    } catch (error) {
      console.error("Erreur chargement vidéo:", error);
    }
  } else if (action === "delete") {
    if (!confirm("Supprimer définitivement cette vidéo ?")) return;
    try {
      await deleteDoc(doc(db, "videos", id));
      await loadVideos();
      resetVideoForm();
    } catch (error) {
      console.error("Erreur suppression vidéo:", error);
      alert("Impossible de supprimer cette vidéo.");
    }
  }
});

logoListEl.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "edit") {
    try {
      const snapshot = await getDocs(collection(db, "trustedLogos"));
      const docSnap = snapshot.docs.find((d) => d.id === id);
      if (!docSnap) return;
      const data = docSnap.data();
      logoIdInput.value = docSnap.id;
      logoAltInput.value = data.alt || "";
      logoFileUrlInput.value = data.fileUrl || "";
      logoOrderInput.value = data.order ?? "";
      if (logoSubmitBtn) logoSubmitBtn.textContent = "Mettre à jour";
    } catch (error) {
      console.error("Erreur chargement logo:", error);
    }
  } else if (action === "delete") {
    if (!confirm("Supprimer définitivement ce logo ?")) return;
    try {
      await deleteDoc(doc(db, "trustedLogos", id));
      await loadLogos();
      resetLogoForm();
    } catch (error) {
      console.error("Erreur suppression logo:", error);
      alert("Impossible de supprimer ce logo.");
    }
  }
});

// ── Soumission des formulaires ─────────────────────────────────────────

audioForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = audioIdInput.value.trim();
  const payload = {
    title: audioTitleInput.value.trim(),
    fileUrl: audioFileUrlInput.value.trim(),
    order: Number(audioOrderInput.value) || 0,
  };
  try {
    if (id) {
      await updateDoc(doc(db, "audioTracks", id), payload);
    } else {
      await addDoc(collection(db, "audioTracks"), payload);
    }
    resetAudioForm();
    await loadAudioTracks();
  } catch (error) {
    console.error("Erreur enregistrement piste:", error);
    alert("Impossible d'enregistrer cette piste.");
  }
});

videoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = videoIdInput.value.trim();
  const payload = {
    title: videoTitleInput.value.trim(),
    alt: videoAltInput.value.trim(),
    fileUrl: videoFileUrlInput.value.trim(),
    youtubeId: videoYoutubeIdInput.value.trim(),
    order: Number(videoOrderInput.value) || 0,
  };
  try {
    if (id) {
      await updateDoc(doc(db, "videos", id), payload);
    } else {
      await addDoc(collection(db, "videos"), payload);
    }
    resetVideoForm();
    await loadVideos();
  } catch (error) {
    console.error("Erreur enregistrement vidéo:", error);
    alert("Impossible d'enregistrer cette vidéo.");
  }
});

logoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = logoIdInput.value.trim();
  const payload = {
    alt: logoAltInput.value.trim(),
    fileUrl: logoFileUrlInput.value.trim(),
    order: Number(logoOrderInput.value) || 0,
  };
  try {
    if (id) {
      await updateDoc(doc(db, "trustedLogos", id), payload);
    } else {
      await addDoc(collection(db, "trustedLogos"), payload);
    }
    resetLogoForm();
    await loadLogos();
  } catch (error) {
    console.error("Erreur enregistrement logo:", error);
    alert("Impossible d'enregistrer ce logo.");
  }
});

audioResetBtn.addEventListener("click", resetAudioForm);
videoResetBtn.addEventListener("click", resetVideoForm);
logoResetBtn.addEventListener("click", resetLogoForm);
