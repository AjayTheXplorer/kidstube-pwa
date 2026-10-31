// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCS36BNGneF1QGuR6rNAEPfn2-1GCDO3jg",
  authDomain: "kidstube-48950.firebaseapp.com",
  projectId: "kidstube-48950",
  storageBucket: "kidstube-48950.firebasestorage.app",
  messagingSenderId: "170412721579",
  appId: "1:170412721579:web:7bc681377ffb55028fbeee",
  measurementId: "G-46N7SRZEG5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);