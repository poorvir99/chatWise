// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOmOUEjDqXkMg1xV7iMM7_FZcsAciSHm0",
    authDomain: "chatwise-50472.firebaseapp.com",
    projectId: "chatwise-50472",
    storageBucket: "chatwise-50472.firebasestorage.app",
    messagingSenderId: "520357557728",
    appId: "1:520357557728:web:df7653d317a712206c2785"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);