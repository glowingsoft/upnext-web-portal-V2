import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const isFirebase = CONFIG.auth.method === 'firebase';
const hasFirebaseConfig = Boolean(CONFIG.firebase.apiKey);


export const firebaseApp = hasFirebaseConfig ? initializeApp(CONFIG.firebase) : {};

export const AUTH = isFirebase ? getAuth(firebaseApp) : {};

export const FIRESTORE = isFirebase ? getFirestore(firebaseApp) : {};
