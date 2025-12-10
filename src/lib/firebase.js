// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
    apiKey: "AIzaSyDGvazXIsRsVYNKoYD58IHeAO6nfqJvzZc",
    authDomain: "storycircuit-29da8.firebaseapp.com",
    projectId: "storycircuit-29da8",
    storageBucket: "storycircuit-29da8.firebasestorage.app",
    messagingSenderId: "356670003718",
    appId: "1:356670003718:web:16e3938a55af3c029ec187",
    measurementId: "G-69RM05BC6P"
};
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
export { getToken, onMessage };
