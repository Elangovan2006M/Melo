import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your.firebaseapp.com",
  projectId: "your_app_id",
  storageBucket: "your_app.firebasestorage.app",
  messagingSenderId: "your_id",
  appId: "your_api_id"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);