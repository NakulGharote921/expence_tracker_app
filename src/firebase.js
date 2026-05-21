import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyD0gkXlf14afN4EW5lUiyxSN6w2787G0Qk',
  authDomain: 'expense-tracker-3d8a3.firebaseapp.com',
  databaseURL:
    'https://expense-tracker-3d8a3-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'expense-tracker-3d8a3',
  storageBucket: 'expense-tracker-3d8a3.firebasestorage.app',
  messagingSenderId: '923350866318',
  appId: '1:923350866318:web:65d46b2d4698a46059acdf',
  measurementId: 'G-CFSKFP7ERX',
};

export const firebaseApp = initializeApp(firebaseConfig);

// Realtime Database (RTDB)
export const db = getDatabase(firebaseApp);

// Analytics only works in browser contexts (and may be blocked by extensions).
export const analyticsPromise =
  typeof window === 'undefined'
    ? Promise.resolve(null)
    : isSupported()
        .then((ok) => (ok ? getAnalytics(firebaseApp) : null))
        .catch(() => null);

