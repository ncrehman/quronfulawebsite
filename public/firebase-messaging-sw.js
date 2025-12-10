importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyDGvazXIsRsVYNKoYD58IHeAO6nfqJvzZc",
    authDomain: "storycircuit-29da8.firebaseapp.com",
    projectId: "storycircuit-29da8",
    storageBucket: "storycircuit-29da8.firebasestorage.app",
    messagingSenderId: "356670003718",
    appId: "1:356670003718:web:16e3938a55af3c029ec187",
    measurementId: "G-69RM05BC6P"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

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
    let selectedImage = payload.data.image || '/categoryog.jpg'; // fallback

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

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url === url && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
