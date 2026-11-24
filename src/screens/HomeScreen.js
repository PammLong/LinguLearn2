import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export const HomeScreen = () => {
  const navigation = useNavigation();
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6 justify-center"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white p-6 rounded-3xl w-full items-center shadow-sm border border-slate-100 my-4">
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

          {/* Nút vào phòng chat với AI Tutor */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Chat")}
            className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center justify-center shadow-md shadow-blue-200 mb-3"
          >
            <Text className="text-white font-bold text-base">💬 Luyện giao tiếp cùng Gia sư AI</Text>
          </TouchableOpacity>

          {/* Nút vào phòng làm bài tập trắc nghiệm thích ứng */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Quiz")}
            className="w-full bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl items-center justify-center shadow-md shadow-emerald-200 mb-4"
          >
            <Text className="text-white font-bold text-base">📝 Trắc nghiệm thích ứng theo năng lực</Text>
          </TouchableOpacity>

          {/* Nút Đăng xuất */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            className="w-full bg-slate-100 active:bg-slate-200 py-3.5 rounded-xl items-center justify-center"
          >
            <Text className="text-slate-600 font-semibold text-sm">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
