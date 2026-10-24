import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { CourseCard } from "../../components/home/CourseCard";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Header chào mừng người học */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-400 text-sm font-medium">Chào mừng trở lại 👋</Text>
            <Text className="text-2xl font-bold text-slate-800">Học viên LinguLearn</Text>
          </View>
          {/* Badge Streak Ngày học */}
          <View className="bg-amber-100 px-3 py-1.5 rounded-2xl flex-row items-center border border-amber-200">
            <Text className="text-base mr-1">🔥</Text>
            <Text className="text-amber-700 font-bold text-xs">5 Ngày</Text>
          </View>
        </View>

        {/* Thẻ AI Tutor Banner */}
        <View className="bg-gradient-to-r bg-blue-600 rounded-3xl p-5 mb-5 shadow-lg shadow-blue-200">
          <Text className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
            Gia sư AI 24/7
          </Text>
          <Text className="text-white text-xl font-bold mb-2">
            Luyện giao tiếp & Sửa ngữ pháp tức thì
          </Text>
          <Text className="text-blue-100 text-xs mb-4 leading-relaxed">
            Trò chuyện với LinguTutor không lo sai ngữ pháp, AI sẽ chỉ lỗi và gợi ý cách dùng từ chuẩn bản xứ.
          </Text>
          <Button
            title="Bắt đầu trò chuyện"
            variant="accent"
            size="md"
            onPress={() => navigation.navigate("Tutor")}
          />
        </View>

        {/* Các tính năng nhanh */}
        <Text className="text-base font-bold text-slate-800 mb-3">Lộ trình hôm nay</Text>
        <View className="flex-row space-x-3 mb-4">
          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mr-2"
            onPress={() => navigation.navigate("Quiz")}
          >
            <Text className="text-2xl mb-2">📝</Text>
            <Text className="font-bold text-slate-800 text-sm">Trắc nghiệm AI</Text>
            <Text className="text-xs text-slate-400 mt-1">5 câu hỏi thích ứng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-2"
            onPress={() => navigation.navigate("Tutor")}
          >
            <Text className="text-2xl mb-2">🎙️</Text>
            <Text className="font-bold text-slate-800 text-sm">Luyện phản xạ</Text>
            <Text className="text-xs text-slate-400 mt-1">Chủ đề tự do</Text>
          </TouchableOpacity>
        </View>

        {/* Khóa học / Chủ đề mẫu */}
        <Text className="text-base font-bold text-slate-800 mb-2">Chủ đề gợi ý</Text>
        <CourseCard
          title="Thực hành phỏng vấn tiếng Anh"
          description="Chuẩn bị câu trả lời và cách diễn đạt chuyên nghiệp cho công việc mơ ước."
          level="B1"
          progress={40}
          onStart={() => navigation.navigate("Tutor")}
        />

        <CourseCard
          title="Tiếng Anh du lịch & gọi món"
          description="Cách đặt vé máy bay, hỏi đường và giao tiếp trôi chảy khi ra nước ngoài."
          level="A2"
          progress={80}
          onStart={() => navigation.navigate("Tutor")}
        />

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

