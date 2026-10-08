import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJc-M8BqDiGwQrDuYP7xK690FFQ7NgxrQ",
  authDomain: "parkinson-s-96f47.firebaseapp.com",
  projectId: "parkinson-s-96f47",
  storageBucket: "parkinson-s-96f47.firebasestorage.app",
  messagingSenderId: "410844746668",
  appId: "1:410844746668:web:7a777e6032cacff5ec6009",
  measurementId: "G-MC4YDLQB1M"
};

// Initialize Firebase safely (avoid re-initialization in HMR)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics conditionally
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('Firebase Analytics not supported in this environment:', err);
    });
}

export default app;
