import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cấu hình Firebase - Dự án LinguLearn2
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDORFdVD8OzSuePfo3FppeCitsXMvtCGLk",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "linggulearn2.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://linggulearn2-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "linggulearn2",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "linggulearn2.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "466691330023",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:466691330023:web:0fb98af3f820085b3e3742",
};

// 1. Khởi tạo Firebase App (Tránh duplicate app khi Fast Refresh trong Expo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Khởi tạo Auth với AsyncStorage để lưu phiên đăng nhập ổn định trên môi trường Expo
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Dự phòng khi Fast Refresh trong quá trình phát triển
  auth = getAuth(app);
}

// 3. Khởi tạo Real-time Database
const database = getDatabase(app);

// Export các dịch vụ lõi để sử dụng trong toàn bộ ứng dụng
export { app, auth, database };
