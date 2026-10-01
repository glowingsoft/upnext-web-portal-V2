importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyARDmsjAfKZPdTAd3xuWd_aF2dmWA0G41c',
  authDomain: 'up-next-bookings.firebaseapp.com',
  projectId: 'up-next-bookings',
  storageBucket: 'up-next-bookings.firebasestorage.app',
  messagingSenderId: '731826579778',
  appId: '1:731826579778:web:50b579543ed4b84a2180db',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM] background message received:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'UpNext', {
    body: body || '',
    icon: icon || '/favicon.ico',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => 'focus' in client);
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});
