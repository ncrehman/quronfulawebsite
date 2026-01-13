// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDeyTR590acMsMkAli1_AJewTNoF4bLbDU",
    authDomain: "quronfula-682e8.firebaseapp.com",
    projectId: "quronfula-682e8",
    storageBucket: "quronfula-682e8.firebasestorage.app",
    messagingSenderId: "255841573292",
    appId: "1:255841573292:web:701e78c7d18db3330ac209",
    measurementId: "G-BMV5BJMHZB"
};

const app = initializeApp(firebaseConfig);

// Only initialize messaging in browser
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { getToken, onMessage };