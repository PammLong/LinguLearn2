import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { loginUser } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

export const LoginScreen = () => {
  const navigation = useNavigation();
  const setUser = useAuthStore((state) => state.setUser);

  // Quản lý trạng thái form bằng useState
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!email.trim() || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    setLoading(true);
    try {
      // 2. Gọi hàm loginUser từ authService để kết nối Firebase Auth
      const result = await loginUser(email, password);
      
      // 3. Cập nhật user vào Zustand store để tự động chuyển vào MainTabs
      if (setUser) {
        setUser(result.user || result);
      }

      Alert.alert("Thành công", `Chào mừng bạn quay trở lại, ${result.displayName || result.email}!`);
    } catch (error) {
      // Bắt lỗi và hiển thị thông báo tiếng Việt từ authService
      console.error("Lỗi đăng nhập:", error);
      Alert.alert("Đăng nhập thất bại", error.message || "Vui lòng kiểm tra lại thông tin đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    if (setUser) {
      setUser({
        uid: "guest_123",
        displayName: "Khách trải nghiệm",
        email: "guest@lingulearn.com",
        targetLanguage: "English",
        currentLevel: "B1",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-6">
            {/* Header & Logo */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-100 rounded-3xl items-center justify-center mb-3 shadow-sm">
                <Text className="text-4xl">🌍</Text>
              </View>
              <Text className="text-3xl font-extrabold text-slate-800 tracking-tight">
                LinguLearn
              </Text>
              <Text className="text-sm text-slate-400 mt-1 text-center font-medium">
                Chinh phục ngoại ngữ cùng gia sư AI thông minh
              </Text>
            </View>

            {/* Form Đăng nhập */}
            <View className="w-full mb-6">
              {/* Trường Email */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Địa chỉ Email
                </Text>
                <TextInput
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-base"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Trường Mật khẩu */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mật khẩu
                </Text>
                <TextInput
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Nút Đăng nhập */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
                className={`w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center justify-center shadow-md shadow-blue-200 ${
                  loading ? "opacity-70" : ""
                }`}
              >
                {loading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-bold text-base ml-2">
                      Đang đăng nhập...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base text-center">
                    Đăng nhập
                  </Text>
                )}
              </TouchableOpacity>

              {/* Nút Trải nghiệm nhanh (Guest) để test toàn bộ giao diện */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleGuestLogin}
                className="w-full bg-slate-100 active:bg-slate-200 py-3.5 rounded-xl items-center justify-center mt-3"
              >
                <Text className="text-slate-600 font-semibold text-sm">
                  Trải nghiệm nhanh (Chế độ khách)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer chuyển sang màn hình Đăng ký */}
            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-sm text-slate-500 font-medium">
                Chưa có tài khoản?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-blue-600">
                  Đăng ký ngay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
