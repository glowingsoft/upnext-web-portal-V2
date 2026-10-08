import { initializeApp } from 'firebase/app';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const hasFirebaseConfig = Boolean(CONFIG.firebase.apiKey);


export const firebaseApp = hasFirebaseConfig ? initializeApp(CONFIG.firebase) : {};

export const AUTH = {};

export const FIRESTORE = {};
