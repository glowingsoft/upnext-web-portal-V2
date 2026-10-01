import { getToken, getMessaging, isSupported } from 'firebase/messaging';

import { CONFIG } from 'src/config-global';

import { firebaseApp } from './firebase';

let messagingInstance;
let supportCheck;

export async function getFcmMessaging() {
  if (!CONFIG.firebase.apiKey) return null;

  supportCheck ??= isSupported().catch(() => false);
  const supported = await supportCheck;
  if (!supported) return null;

  messagingInstance ??= getMessaging(firebaseApp);
  return messagingInstance;
}

async function fetchToken(registration) {
  const messaging = await getFcmMessaging();
  if (!messaging) return null;

  return getToken(messaging, {
    vapidKey: CONFIG.firebase.vapidKey,
    serviceWorkerRegistration: registration,
  });
}

// Used as the `deviceId` sent to the backend on login/signup so push notifications can be
// targeted at this specific browser — prompts for permission if not yet decided. Falls
// back to null (never throws) whenever messaging isn't available (unsupported browser,
// no config, permission denied, etc.).
export async function getFcmToken() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    return await fetchToken(registration);
  } catch (error) {
    console.error('[FCM] getFcmToken failed:', error);
    return null;
  }
}

// Same token, but never prompts — used at logout so we can tell the backend which device
// to unregister without surprising the user with a permission popup on their way out.
export async function getFcmTokenIfGranted() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  if (Notification?.permission !== 'granted') return null;

  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration) return null;

    return await fetchToken(registration);
  } catch (error) {
    console.error('[FCM] getFcmTokenIfGranted failed:', error);
    return null;
  }
}
