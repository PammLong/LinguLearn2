import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "../common/Button";

/**
 * Thẻ khóa học / chủ đề học tập mẫu với NativeWind
 * @param {string} title - Tên chủ đề
 * @param {string} description - Mô tả ngắn
 * @param {string} level - Cấp độ (A1, A2, B1...)
 * @param {number} progress - Tiến độ học (0 - 100%)
 * @param {function} onStart - Sự kiện bấm bắt đầu
 */
export const CourseCard = ({
  title = "Tiếng Anh giao tiếp hàng ngày",
  description = "Luyện phản xạ với gia sư AI qua 20 mẫu câu phổ biến nhất.",
  level = "B1",
  progress = 65,
  onStart,
}) => {
  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 my-2">
      {/* Header của thẻ: Level Badge & Trạng thái */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          <Text className="text-blue-600 text-xs font-bold tracking-wider">
            CẤP ĐỘ {level}
          </Text>
        </View>
        <Text className="text-slate-400 text-xs font-medium">
          Đã hoàn thành {progress}%
        </Text>
      </View>

      {/* Nội dung chính */}
      <Text className="text-lg font-bold text-slate-800 mb-1 leading-tight">
        {title}
      </Text>
      <Text className="text-sm text-slate-500 mb-4 leading-relaxed">
        {description}
      </Text>

      {/* Thanh tiến độ (Progress bar) */}
      <View className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
        <View
          className="bg-blue-600 h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Nút hành động */}
      <Button
        title="Luyện tập ngay"
        variant="primary"
        size="md"
        onPress={onStart}
        className="w-full shadow-md shadow-blue-200"
      />
    </View>
  );
};

