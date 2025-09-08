import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCfL8ZSOz1qj4HobhcAJu42-5Q50DSkFo",
  authDomain: "rcvcoffee.firebaseapp.com",
  projectId: "rcvcoffee",
  storageBucket: "rcvcoffee.firebasestorage.app",
  messagingSenderId: "215534004909",
  appId: "1:215534004909:web:bbb87426178287dabff424",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스들
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
