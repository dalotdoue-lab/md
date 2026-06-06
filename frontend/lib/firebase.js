import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyAKuJR3iJkMsnrd5aZOYctqf6QrqRGcofI',
  authDomain: 'stkpush-cff51.firebaseapp.com',
  databaseURL: 'https://stkpush-cff51-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'stkpush-cff51',
  storageBucket: 'stkpush-cff51.firebasestorage.app',
  messagingSenderId: '567137630101',
  appId: '1:567137630101:web:1e4c94b7f4be476b31289c',
  measurementId: 'G-HY5VQQ4HQG',
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
