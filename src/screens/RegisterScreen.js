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
import { registerUser } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

export const RegisterScreen = () => {
  const navigation = useNavigation();
  const setUser = useAuthStore((state) => state.setUser);

  // Quản lý trạng thái form bằng useState
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!displayName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập Họ và tên của bạn!");
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Thông báo", "Mật khẩu phải chứa ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      // 2. Gọi hàm registerUser từ authService để đăng ký và lưu Realtime DB
      const result = await registerUser(email, password, displayName);

      // 3. Cập nhật user vào Zustand store (Hệ thống sẽ tự động chuyển vào MainTabs)
      if (setUser) {
        setUser(result.user || result);
      }

      Alert.alert(
        "Đăng ký thành công",
        `Chào mừng ${displayName} đến với LinguLearn! Bạn có thể bắt đầu học ngay bây giờ.`
      );
    } catch (error) {
      // Bắt lỗi và hiển thị thông báo tiếng Việt từ authService
      console.error("Lỗi đăng ký:", error);
      Alert.alert("Đăng ký thất bại", error.message || "Đã có lỗi xảy ra khi tạo tài khoản.");
    } finally {
      setLoading(false);
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
                <Text className="text-4xl">🚀</Text>
              </View>
              <Text className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Tạo tài khoản
              </Text>
              <Text className="text-sm text-slate-400 mt-1 text-center font-medium">
                Bắt đầu lộ trình chinh phục ngoại ngữ thông minh
              </Text>
            </View>

            {/* Form Đăng ký */}
            <View className="w-full mb-6">
              {/* Trường Họ tên */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Họ và tên
                </Text>
                <TextInput
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-base"
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#94a3b8"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>

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
                  Mật khẩu (tối thiểu 6 ký tự)
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

              {/* Nút Đăng ký */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRegister}
                disabled={loading}
                className={`w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center justify-center shadow-md shadow-blue-200 ${
                  loading ? "opacity-70" : ""
                }`}
              >
                {loading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-bold text-base ml-2">
                      Đang tạo tài khoản...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base text-center">
                    Đăng ký
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer chuyển sang màn hình Đăng nhập */}
            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-sm text-slate-500 font-medium">
                Đã có tài khoản?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate("Login");
                  }
                }}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-blue-600">
                  Đăng nhập
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
