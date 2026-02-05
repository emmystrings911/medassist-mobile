// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBarlqEi1-8I_dNBGRayGDLdfSLplgDJ_0",
  authDomain: "medassist-7c812.firebaseapp.com",
  projectId: "medassist-7c812",
  storageBucket: "medassist-7c812.firebasestorage.app",
  messagingSenderId: "222777374586",
  appId: "1:222777374586:web:6c43db1f2ce34149b608c3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
