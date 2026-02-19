// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your specific configuration
const firebaseConfig = {
    apiKey: "AIzaSyB69iqUxaomqDyIc_xnZzwIFm0DN9qge-s",
    authDomain: "putting-part.firebaseapp.com",
    projectId: "putting-part",
    storageBucket: "putting-part.firebasestorage.app",
    messagingSenderId: "111391132940",
    appId: "1:111391132940:web:16eef5956adc53d44acd29",
    measurementId: "G-Z8S7V3Q7H1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT analytics so it is considered "used"
export const analytics = getAnalytics(app);

// Export the other services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();