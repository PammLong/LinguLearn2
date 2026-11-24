import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useAuthStore } from "../store/useAuthStore";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { QuizScreen } from "../screens/QuizScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  // 1. Quản lý trạng thái khởi tạo (initializing) và thông tin user hiện tại
  const [initializing, setInitializing] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const storeUser = useAuthStore((state) => state.user);
  const setStoreUser = useAuthStore((state) => state.setUser);

  // 2. Lắng nghe thay đổi trạng thái đăng nhập từ Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        setStoreUser(currentUser);
      }
      if (initializing) {
        setInitializing(false);
      }
    });

    // Cleanup listener khi component unmount
    return unsubscribe;
  }, []);

  // Người dùng hiện tại có thể từ Firebase Auth hoặc từ Zustand store (ví dụ: chế độ Khách)
  const activeUser = firebaseUser || storeUser;

  // 3. Hiển thị màn hình loading chờ Firebase kiểm tra phiên đăng nhập
  if (initializing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // 4. Phân luồng điều hướng dựa trên trạng thái user
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {activeUser ? (
        // Khi đã đăng nhập (user tồn tại)
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
        </>
      ) : (
        // Khi chưa đăng nhập (!activeUser)
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
