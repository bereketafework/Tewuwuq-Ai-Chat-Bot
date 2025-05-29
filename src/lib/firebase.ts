// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "tewuwuq.firebaseapp.com",
  projectId: "tewuwuq",
  storageBucket: "tewuwuq.firebasestorage.app", // Used as provided
  messagingSenderId: "377089827375",
  appId: "1:377089827375:web:23a609fadddeae79119cda"
};

// Initialize Firebase
let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };
