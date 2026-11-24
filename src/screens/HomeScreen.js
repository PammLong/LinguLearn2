import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export const HomeScreen = () => {
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      Alert.alert("Lỗi", "Không thể đăng xuất lúc này. Vui lòng thử lại!");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-6">
      <View className="bg-white p-6 rounded-3xl w-full items-center shadow-sm border border-slate-100">
        <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4 shadow-xs">
          <Text className="text-4xl">👋</Text>
        </View>

        <Text className="text-2xl font-bold text-slate-800 mb-1 text-center">
          Chào mừng bạn!
        </Text>
        
        <Text className="text-sm font-medium text-slate-500 mb-6 text-center">
          {currentUser?.email || "Người dùng LinguLearn"}
        </Text>

        <View className="bg-blue-50 px-4 py-2.5 rounded-2xl mb-6 w-full items-center border border-blue-100">
          <Text className="text-xs text-blue-700 font-semibold">
            ✓ Trạng thái: Đã đăng nhập qua Firebase Auth
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="w-full bg-red-500 active:bg-red-600 py-3.5 rounded-xl items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-base">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

