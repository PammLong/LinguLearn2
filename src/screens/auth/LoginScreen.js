import React, { useState } from "react";
import { View, Text, TextInput, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { registerUser, loginUser } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/common/Button";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    if (isRegistering && !displayName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập họ và tên của bạn!");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isRegistering) {
        result = await registerUser(email, password, displayName);
      } else {
        result = await loginUser(email, password);
      }
      setUser(result.user);
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      Alert.alert("Lỗi", error.message || "Xác thực thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setUser({
      uid: "guest_user_123",
      displayName: "Khách trải nghiệm",
      email: "guest@lingulearn.com",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6">
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-blue-100 rounded-3xl items-center justify-center mb-2">
            <Text className="text-3xl">🌍</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800">LinguLearn</Text>
          <Text className="text-xs text-slate-400 mt-1">
            {isRegistering ? "Tạo tài khoản học mới" : "Đăng nhập vào tài khoản của bạn"}
          </Text>
        </View>

        {/* Display name input (Chỉ hiển thị khi Đăng ký) */}
        {isRegistering && (
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-700 mb-1">Họ và tên</Text>
            <TextInput
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-800"
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#94a3b8"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>
        )}

        {/* Email input */}
        <Text className="text-xs font-bold text-slate-700 mb-1">Email</Text>
        <TextInput
          className="bg-slate-100 rounded-xl px-4 py-3 text-slate-800 mb-4"
          placeholder="example@gmail.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password input */}
        <Text className="text-xs font-bold text-slate-700 mb-1">Mật khẩu</Text>
        <TextInput
          className="bg-slate-100 rounded-xl px-4 py-3 text-slate-800 mb-6"
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Nút hành động chính */}
        <Button
          title={isRegistering ? "Đăng ký tài khoản" : "Đăng nhập"}
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleAuth}
          className="mb-3"
        />

        {/* Chế độ khách */}
        <Button
          title="Trải nghiệm ngay (Chế độ khách)"
          variant="outline"
          size="md"
          onPress={handleGuestLogin}
          className="mb-4"
        />

        <TouchableOpacity
          onPress={() => setIsRegistering(!isRegistering)}
          className="items-center mt-2"
        >
          <Text className="text-xs text-blue-600 font-semibold">
            {isRegistering
              ? "Đã có tài khoản? Đăng nhập ngay"
              : "Chưa có tài khoản? Đăng ký ngay"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
