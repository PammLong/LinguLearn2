import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useAuthStore } from "../store/useAuthStore";
import {
  subscribeToUserProgress,
  subscribeToRecentExercises,
} from "../services/progressService";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const storeUser = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const currentUser = auth.currentUser || storeUser;
  const uid = currentUser?.uid || "guest_user";

  // Lấy tên hiển thị hoặc trích xuất từ email
  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Học viên LinguLearn";

  // State tiến độ học tập và bài tập gần nhất
  const [progress, setProgress] = useState({
    totalScore: 0,
    streakDays: 0,
    lastActive: null,
  });
  const [recentExercises, setRecentExercises] = useState([]);

  // 1. Lắng nghe dữ liệu thời gian thực từ Firebase Realtime Database
  useEffect(() => {
    // Lắng nghe điểm số và streak
    const unsubscribeProgress = subscribeToUserProgress(uid, (data) => {
      setProgress(data);
    });

    // Lắng nghe 5 bài trắc nghiệm gần nhất
    const unsubscribeExercises = subscribeToRecentExercises(uid, (exercises) => {
      setRecentExercises(exercises);
    });

    // Cleanup listeners khi component unmount
    return () => {
      if (typeof unsubscribeProgress === "function") unsubscribeProgress();
      if (typeof unsubscribeExercises === "function") unsubscribeExercises();
    };
  }, [uid]);

  // Xử lý đăng xuất tài khoản
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("Lỗi đăng xuất Firebase:", error);
          }
          if (logoutStore) {
            logoutStore();
          }
        },
      },
    ]);
  };

  // Helper định dạng ngày giờ ngắn gọn
  const formatExerciseTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return `Hôm nay, ${timeStr}`;
    }
    return `${date.getDate()}/${date.getMonth() + 1}, ${timeStr}`;
  };

  // Tính khoảng cách an toàn cho Header tránh notch, camera và status bar
  const topSafePadding =
    Math.max(
      insets.top,
      Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 20
    ) + 14;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: topSafePadding,
          paddingHorizontal: 18,
          paddingBottom: Math.max(insets.bottom, 24) + 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* 1. HEADER NGƯỜI DÙNG - THIẾT KẾ RỘNG RÃI & SANG TRỌNG */}
        {/* ======================================================== */}
        <View className="bg-white rounded-3xl p-5 mb-5 shadow-xs border border-slate-100">
          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center flex-1 mr-3">
              {/* Avatar nổi bật */}
              <View className="w-13 h-13 rounded-2xl bg-blue-600 items-center justify-center mr-3.5 shadow-md shadow-blue-200">
                <Text className="text-2xl text-white">🎓</Text>
              </View>

              {/* Lời chào & Tên người dùng */}
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Chào mừng trở lại 👋
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-2xl font-black text-slate-800 tracking-tight mt-0.5"
                >
                  {displayName}
                </Text>
              </View>
            </View>

            {/* Nút Đăng xuất gọn gàng */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              className="bg-red-50 border border-red-200/80 px-3.5 py-2 rounded-xl items-center justify-center"
            >
              <Text className="text-red-600 text-xs font-bold">Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          {/* Dải nhãn thông tin Mục tiêu & Cấp độ */}
          <View className="flex-row flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <View className="bg-blue-50 border border-blue-200/60 px-3 py-1.5 rounded-full flex-row items-center">
              <Text className="text-xs mr-1.5">🇬🇧</Text>
              <Text className="text-xs font-bold text-blue-700">Tiếng Anh</Text>
            </View>

            <View className="bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full flex-row items-center">
              <Text className="text-xs mr-1.5">⭐</Text>
              <Text className="text-xs font-bold text-amber-700">Cấp độ B1</Text>
            </View>

            {currentUser?.isAnonymous && (
              <View className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full flex-row items-center">
                <Text className="text-xs font-semibold text-slate-600">Khách</Text>
              </View>
            )}
          </View>
        </View>

        {/* ======================================================== */}
        {/* 2. THẺ THỐNG KÊ TIẾN ĐỘ THỜI GIAN THỰC (STATS CARDS) */}
        {/* ======================================================== */}
        <View className="flex-row mb-6">
          {/* Thẻ 1: Điểm tích lũy */}
          <View className="flex-1 bg-white rounded-2xl p-4 mr-2 border border-slate-100 shadow-xs justify-between">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Điểm tích lũy
              </Text>
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center">
                <Text className="text-base">⭐</Text>
              </View>
            </View>
            <View>
              <Text className="text-2xl font-black text-slate-800">
                {progress.totalScore}
                <Text className="text-xs font-semibold text-slate-400"> pts</Text>
              </Text>
              <Text className="text-[11px] text-emerald-600 font-medium mt-0.5">
                +10đ / quiz • +5đ / chat
              </Text>
            </View>
          </View>

          {/* Thẻ 2: Chuỗi ngày học liên tiếp */}
          <View className="flex-1 bg-white rounded-2xl p-4 ml-2 border border-slate-100 shadow-xs justify-between">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Chuỗi ngày học
              </Text>
              <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center">
                <Text className="text-base">🔥</Text>
              </View>
            </View>
            <View>
              <Text className="text-2xl font-black text-slate-800">
                {progress.streakDays}
                <Text className="text-xs font-semibold text-slate-400"> ngày</Text>
              </Text>
              <Text className="text-[11px] text-orange-600 font-medium mt-0.5">
                {progress.streakDays > 0 ? "Đang giữ chuỗi xuất sắc!" : "Học ngay để tạo chuỗi"}
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 3. KHU VỰC HÀNH ĐỘNG NHANH (QUICK ACTIONS) */}
        {/* ======================================================== */}
        <Text className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Lộ trình học hôm nay
        </Text>

        {/* Action 1: Gia sư AI Chat */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Chat")}
          className="bg-blue-600 rounded-3xl p-5 mb-3.5 shadow-md shadow-blue-200"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="bg-blue-500/60 px-2.5 py-1 rounded-full border border-blue-400/30">
              <Text className="text-white text-[11px] font-bold uppercase tracking-wider">
                Gia sư AI 24/7
              </Text>
            </View>
            <Text className="text-2xl">🤖</Text>
          </View>

          <Text className="text-white text-lg font-bold mb-1">
            Luyện giao tiếp & Sửa ngữ pháp
          </Text>
          <Text className="text-blue-100 text-xs leading-relaxed mb-4">
            Trò chuyện tương tác với LinguTutor không lo sai câu. AI phản hồi tự nhiên và gợi ý sửa lỗi tức thì.
          </Text>

          <View className="bg-white/15 rounded-xl py-2.5 px-4 flex-row items-center justify-between border border-white/20">
            <Text className="text-white text-xs font-bold">
              Bắt đầu trò chuyện ngay
            </Text>
            <Text className="text-white font-bold text-sm">➔</Text>
          </View>
        </TouchableOpacity>

        {/* Action 2: Trắc nghiệm thích ứng */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Quiz")}
          className="bg-white rounded-3xl p-5 mb-6 border border-slate-100 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <Text className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                Thích ứng năng lực
              </Text>
            </View>
            <Text className="text-2xl">📝</Text>
          </View>

          <Text className="text-slate-800 text-lg font-bold mb-1">
            Trắc nghiệm cá nhân hóa
          </Text>
          <Text className="text-slate-500 text-xs leading-relaxed mb-4">
            Đề kiểm tra tự động sinh theo trình độ B1 và tập trung củng cố các điểm yếu từ phiên hội thoại trước.
          </Text>

          <View className="bg-emerald-50 rounded-xl py-2.5 px-4 flex-row items-center justify-between border border-emerald-100">
            <Text className="text-emerald-700 text-xs font-bold">
              Làm bài kiểm tra ngay
            </Text>
            <Text className="text-emerald-700 font-bold text-sm">➔</Text>
          </View>
        </TouchableOpacity>

        {/* ======================================================== */}
        {/* 4. LỊCH SỬ LUYỆN TẬP GẦN ĐÂY */}
        {/* ======================================================== */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Bài kiểm tra gần đây
          </Text>
          {recentExercises.length > 0 && (
            <Text className="text-xs text-slate-400 font-medium">
              Gần nhất {recentExercises.length} bài
            </Text>
          )}
        </View>

        {recentExercises.length === 0 ? (
          /* Trạng thái chưa có bài thi nào */
          <View className="bg-white rounded-2xl p-6 items-center justify-center border border-slate-100 shadow-xs mb-4">
            <View className="w-12 h-12 bg-slate-50 rounded-full items-center justify-center mb-2">
              <Text className="text-2xl">🌱</Text>
            </View>
            <Text className="text-sm font-bold text-slate-700 text-center mb-0.5">
              Chưa có lịch sử làm bài
            </Text>
            <Text className="text-xs text-slate-400 text-center leading-relaxed">
              Hãy hoàn thành bài trắc nghiệm đầu tiên để lưu lại tiến trình và tích lũy điểm thưởng nhé!
            </Text>
          </View>
        ) : (
          /* Danh sách các bài tập gần đây */
          <View className="space-y-2.5">
            {recentExercises.map((exercise) => {
              const total = exercise.totalQuestions || 5;
              const scoreVal = exercise.score || 0;
              const percentage = Math.round((scoreVal / total) * 100);
              const isHigh = percentage >= 70;

              return (
                <View
                  key={exercise.id}
                  className="bg-white rounded-2xl p-4 mb-2.5 flex-row items-center justify-between border border-slate-100 shadow-xs"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    {/* Badge điểm số hình tròn */}
                    <View
                      className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${
                        isHigh ? "bg-emerald-50 border border-emerald-200" : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-extrabold ${
                          isHigh ? "text-emerald-700" : "text-blue-700"
                        }`}
                      >
                        {scoreVal}/{total}
                      </Text>
                    </View>

                    {/* Chi tiết chủ đề và thời gian */}
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text
                          numberOfLines={1}
                          className="font-bold text-slate-800 text-sm mr-2 flex-1"
                        >
                          {exercise.topic || "Trắc nghiệm tổng hợp"}
                        </Text>
                        <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                          <Text className="text-[10px] font-bold text-slate-600">
                            {exercise.level || "B1"}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-slate-400 mt-0.5">
                        {formatExerciseTime(exercise.timestamp)} • Đạt {percentage}%
                      </Text>
                    </View>
                  </View>

                  <Text className="text-base text-slate-300">›</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
