import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export async function requestFirebaseNotificationPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log("FCM Token:", token);
      // Send token to your backend server OR Firestore
      return token;
    } else {
      console.warn("No registration token available.");
    }
  } catch (err) {
    console.error("Error getting token:", err);
  }
}

export function listenForMessages() {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
  });
}
