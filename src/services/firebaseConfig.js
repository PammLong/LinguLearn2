import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getDatabase, ref, set, push, onValue } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cấu hình Firebase - Được lấy từ biến môi trường của Expo (tiền tố EXPO_PUBLIC_)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSy_MOCK_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "lingulearn-app.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://lingulearn-app-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "lingulearn-app",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "lingulearn-app.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

// 1. Khởi tạo Firebase App (Tránh duplicate app khi Fast Refresh trong Expo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Khởi tạo Auth với cơ chế lưu session qua AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Dự phòng khi Fast Refresh
  auth = getAuth(app);
}

// 3. Khởi tạo Real-time Database
const database = getDatabase(app);

/**
 * Helper: Lưu tin nhắn hội thoại vào Real-time Database
 * @param {string} userId
 * @param {object} messageData
 */
export const saveMessageToRealtime = async (userId, messageData) => {
  try {
    const messagesRef = ref(database, `chats/${userId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
      ...messageData,
      createdAt: Date.now(),
    });
    return newMessageRef.key;
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn Real-time DB:", error);
    throw error;
  }
};

/**
 * Helper: Lưu kết quả bài tập trắc nghiệm
 * @param {string} userId
 * @param {object} quizResult
 */
export const saveQuizResultToRealtime = async (userId, quizResult) => {
  try {
    const quizRef = ref(database, `quizzes/${userId}/results`);
    const newResultRef = push(quizRef);
    await set(newResultRef, {
      ...quizResult,
      completedAt: Date.now(),
    });
    return newResultRef.key;
  } catch (error) {
    console.error("Lỗi khi lưu kết quả bài tập:", error);
    throw error;
  }
};

export { app, auth, database };

