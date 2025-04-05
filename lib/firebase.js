// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";  // Import getAuth from Firebase
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwXWp1iEwUFyXs7LOxAcQ8P4rtjQMH3Eo",
  authDomain: "terosmd.firebaseapp.com",
  projectId: "terosmd",
  storageBucket: "terosmd.firebasestorage.app",
  messagingSenderId: "906566023341",
  appId: "1:906566023341:web:8cae79c5d5afced684ae24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;