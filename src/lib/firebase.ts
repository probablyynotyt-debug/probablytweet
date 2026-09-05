import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyARymA9MxsP_nNAWL6_NTaDPwI9KjLKYmA",
  authDomain: "probably-tweet-9716f.firebaseapp.com",
  projectId: "probably-tweet-9716f",
  storageBucket: "probably-tweet-9716f.firebasestorage.app",
  messagingSenderId: "223043542716",
  appId: "1:223043542716:web:156be73cc3521e01a3fab9",
  measurementId: "G-751PF4WYCB"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
