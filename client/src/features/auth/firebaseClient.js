import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialized lazily, on first actual use — not at import time. This
// file is imported by authSlice.js, which is imported by the store,
// which is imported by main.jsx, so an eager getAuth() call here
// would crash the *entire* app on load if Firebase env vars aren't
// filled in yet, even for pages that never touch login.
let authInstance = null;
let googleProvider = null;

function ensureFirebase() {
  if (!authInstance) {
    if (!firebaseConfig.apiKey) {
      throw new Error(
        'Firebase is not configured — fill in VITE_FIREBASE_* in .env (see Firebase Console → Project settings → Your apps).'
      );
    }
    const firebaseApp = initializeApp(firebaseConfig);
    authInstance = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
  }
  return { authInstance, googleProvider };
}

/**
 * Opens the Google sign-in popup and returns the Firebase ID token our
 * backend's POST /auth/google verifies server-side. We never trust
 * anything else about the user client-side — the backend re-derives
 * name/email/uid from this token itself.
 */
export async function getGoogleIdToken() {
  const { authInstance: auth, googleProvider: provider } = ensureFirebase();
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
