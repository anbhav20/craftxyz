import admin from 'firebase-admin';

/**
 * Initializes firebase-admin exactly once. We only use this to verify
 * ID tokens the frontend gets from the Firebase client SDK after a
 * Google sign-in popup — the backend never talks to Google directly.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // .env stores the key with literal \n escapes (can't have real
      // newlines in a single env var line) — convert them back here.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const firebaseAuth = admin.auth();
