// ── Firebase Configuration ──────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGIjtHa251FpHMtF4LW2iD8Yz-JtyB67Y",
  authDomain: "alfredostore-19858.firebaseapp.com",
  projectId: "alfredostore-19858",
  storageBucket: "alfredostore-19858.firebasestorage.app",
  messagingSenderId: "503517454506",
  appId: "1:503517454506:web:7bbfb0f593a379227930d3",
  measurementId: "G-NGBC5SYW0E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ── Cloudinary Configuration ─────────────────────────────────────────────
export const CLOUDINARY_CLOUD_NAME = "dyxdcnunh";
export const CLOUDINARY_UPLOAD_PRESET = "alfredostore_preset";
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
