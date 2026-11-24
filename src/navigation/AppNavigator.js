import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { HomeScreen } from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  // 1. Quản lý trạng thái khởi tạo (initializing) và thông tin user hiện tại
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // 2. Lắng nghe thay đổi trạng thái đăng nhập từ Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) {
        setInitializing(false);
      }
    });

    // Cleanup listener khi component unmount
    return unsubscribe;
  }, []);

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
      {user ? (
        // Khi đã đăng nhập (user tồn tại)
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // Khi chưa đăng nhập (!user)
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

