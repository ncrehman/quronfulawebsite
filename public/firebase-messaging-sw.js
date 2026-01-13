// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyDeyTR590acMsMkAli1_AJewTNoF4bLbDU",
  authDomain: "quronfula-682e8.firebaseapp.com",
  projectId: "quronfula-682e8",
  storageBucket: "quronfula-682e8.firebasestorage.app",
  messagingSenderId: "255841573292",
  appId: "1:255841573292:web:701e78c7d18db3330ac209"
});

const messaging = firebase.messaging();

// Optional: customize notification display when app is in foreground/background

messaging.onBackgroundMessage((payload) => {
    // console.log('[SW] Received background message: ', payload);

    // Prefer data payload if notification is missing
    const title = payload.notification?.title || payload.data.title || "Quronfula";
    const body = payload.notification?.body || payload.data.body || "New notification";
    const icon = payload.data.icon || "/icons/android-icon-192x192.png";
    const clickUrl = payload.data.url || "/";
    const badge = "/icons/android-icon-72x72.png";

    const imageMobile = payload.data.image_mobile;
    const imageSquare = payload.data.image_square;
    const imageDesktop = payload.data.image_desktop;
    let selectedImage = payload.data.image || '/category_og.webp'; // fallback

    try {
        // Detect approximate screen shape
        const width = self.screen?.width || 720;
        const height = self.screen?.height || 1280;
        const aspectRatio = width / height;

        if (Math.abs(aspectRatio - 1) < 0.1 && imageSquare) {
            // nearly square screen
            selectedImage = imageSquare;
        } else if (aspectRatio > 1.2 && imageDesktop) {
            // landscape screen (desktop/tablet)
            selectedImage = imageDesktop;
        } else if (imageMobile) {
            // default to portrait/mobile
            selectedImage = imageMobile;
        }
    } catch (e) {
        console.warn("⚠️ Could not detect aspect ratio, using fallback image.");
    }

    const notificationOptions = {
        body: body,
        icon: icon,
        image: selectedImage,
        data: { url: clickUrl },
        badge: badge
    };

    self.registration.showNotification(title, notificationOptions);
});