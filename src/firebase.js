import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    addDoc, 
    collection, 
    query, 
    onSnapshot,
    serverTimestamp,
    setLogLevel
} from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// 1. Firebase 설정값
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 2. Firebase 초기화
let app, auth, db, storage;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    setLogLevel('Debug');
} catch (e) {
    console.error("Firebase 초기화 오류:", e);
}

// 3. 필요한 모듈과 인스턴스 내보내기
export { 
  app, 
  auth, 
  db, 
  storage,
  // 함수들도 함께 내보내면 import가 편리해집니다.
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  doc,
  addDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp,
  ref,
  uploadString,
  getDownloadURL
};