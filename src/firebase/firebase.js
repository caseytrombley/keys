// Import the Firebase SDK and Firestore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration object (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCUQzmcJAjr5bhJEvGqDfSz_6FizfkJcO0",
  authDomain: "chords-ec5ce.firebaseapp.com",
  projectId: "chords-ec5ce",
  storageBucket: "chords-ec5ce.appspot.com",
  messagingSenderId: "1051494703308",
  appId: "1:1051494703308:web:81c6ad54beafb7423d2269",
  measurementId: "G-Q1HTXDQTJW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
const db = getFirestore(app);
export { db };
