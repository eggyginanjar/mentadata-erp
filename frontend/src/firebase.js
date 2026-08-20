// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// GANTI BAGIAN INI dengan kode firebaseConfig milik Anda sendiri (dari Tahap 1)
const firebaseConfig = {
  apiKey: "AIzaSyA1LK4Y1obtuRsG6RlmQeMGmSxoaeE8Eg4",
  authDomain: "mentadata-erp.firebaseapp.com",
  projectId: "mentadata-erp",
  storageBucket: "mentadata-erp.appspot.com",
  messagingSenderId: "511673615524",
  appId: "1:511673615524:web:32ebe36c787eee72341231"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi layanan yang akan kita pakai
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };