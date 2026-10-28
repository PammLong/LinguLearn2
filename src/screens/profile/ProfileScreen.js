import React from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/common/Button";
import { CEFR_LEVELS } from "../../constants";
import { logoutUser } from "../../services/authService";

export const ProfileScreen = () => {
  const { user, targetLanguage, currentLevel, setCurrentLevel, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Lỗi đăng xuất Firebase:", e);
    } finally {
      logout();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Card hồ sơ người dùng */}
        <View className="bg-white rounded-3xl p-6 items-center shadow-sm border border-slate-100 mb-6">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-3">
            <Text className="text-3xl">🎓</Text>
          </View>
          <Text className="text-xl font-bold text-slate-800">
            {user?.displayName || "Người học LinguLearn"}
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5">
            {user?.email || "hocvien@lingulearn.com"}
          </Text>

          <View className="flex-row items-center mt-4 bg-blue-50 px-4 py-2 rounded-2xl">
            <Text className="text-xs font-semibold text-blue-700">
              Mục tiêu: {targetLanguage} • Cấp độ {currentLevel}
            </Text>
          </View>
        </View>

        {/* Tùy chỉnh cấp độ CEFR */}
        <Text className="text-base font-bold text-slate-800 mb-3">Chọn cấp độ CEFR mong muốn</Text>
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6">
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = currentLevel === lvl.id;
            return (
              <TouchableOpacity
                key={lvl.id}
                onPress={() => setCurrentLevel(lvl.id)}
                className={`p-3 rounded-2xl flex-row items-center justify-between mb-2 border ${
                  isSelected ? "bg-blue-50 border-blue-500" : "bg-slate-50 border-transparent"
                }`}
              >
                <View>
                  <Text className={`font-bold text-sm ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                    {lvl.label}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">{lvl.description}</Text>
                </View>
                {isSelected && <Text className="text-blue-600 font-bold text-lg">✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nút Đăng xuất */}
        <Button
          title="Đăng xuất tài khoản"
          variant="outline"
          size="md"
          className="border-red-500"
          textClassName="text-red-500"
          onPress={handleLogout}
        />
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};
