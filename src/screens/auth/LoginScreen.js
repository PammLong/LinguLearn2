import React, { useState } from "react";
import { View, Text, TextInput, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/common/Button";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      setUser(userCredential.user);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      Alert.alert("Lỗi", error.message || "Đăng nhập thất bại.");
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

        {/* Chế độ khách (để tiện test ngay không cần setup Firebase Auth trước) */}
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

