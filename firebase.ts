import { getApps, initializeApp } from "firebase/app";

// Web app's Firebase configuration
// These values come from your GoogleService-Info.plist / google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyA5YvtdkUQlrkWlXpl6EH05sa4IfQZNjLk",
  authDomain: "holiday-hero-13bd7.firebaseapp.com",
  projectId: "holiday-hero-13bd7",
  storageBucket: "holiday-hero-13bd7.firebasestorage.app",
  messagingSenderId: "804186028933",
  appId: "1:804186028933:web:3864032d9fbb081985a2ec",
  measurementId: "G-3RGNMYFJTK"
};

// Only initialize once (important for hot-reload / SSR)
if (!getApps().length) {
  initializeApp(firebaseConfig);
}