// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb3bc7eq6KsJOigrtPYT5DZnNc8D5yxWE",
  authDomain: "horoscope360-e1430.firebaseapp.com",
  projectId: "horoscope360-e1430",
  storageBucket: "horoscope360-e1430.firebasestorage.app",
  messagingSenderId: "103255241020",
  appId: "1:103255241020:web:50ed4c1c04dea734d9ee39",
  measurementId: "G-98DZH40E06",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
