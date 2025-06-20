// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAGjAs4yB3UFND5pshb7zfe2KU2onNCYQ",
  authDomain: "health-monitoring-system-c82ce.firebaseapp.com",
  databaseURL: "https://health-monitoring-system-c82ce-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "health-monitoring-system-c82ce",
  storageBucket: "health-monitoring-system-c82ce.firebasestorage.app",
  messagingSenderId: "334618541805",
  appId: "1:334618541805:web:043b1468d21d77e7fb16e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app)

export { db };