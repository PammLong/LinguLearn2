import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTutorStore } from "../../store/useTutorStore";
import { useAuthStore } from "../../store/useAuthStore";

export const TutorScreen = () => {
  const [inputText, setInputText] = useState("");
  const { messages, isTyping, error, sendMessage } = useTutorStore();
  const { user, targetLanguage, currentLevel } = useAuthStore();
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    sendMessage(text, user?.uid || "anonymous", targetLanguage, currentLevel);
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === "user";

    return (
      <View className={`my-2 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}>
        {/* Bong bóng tin nhắn */}
        <View
          className={`p-4 rounded-3xl ${
            isUser
              ? "bg-blue-600 rounded-tr-none shadow-sm"
              : "bg-white border border-slate-200 rounded-tl-none shadow-sm"
          }`}
        >
          <Text
            className={`text-base leading-relaxed ${
              isUser ? "text-white" : "text-slate-800"
            }`}
          >
            {item.text}
          </Text>
        </View>

        {/* Khung gợi ý sửa ngữ pháp nếu có lỗi */}
        {item.correction && (
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mt-1.5 shadow-sm">
            <View className="flex-row items-center mb-1">
              <Text className="text-amber-700 font-bold text-xs">
                💡 Góp ý ngữ pháp:
              </Text>
            </View>
            <Text className="text-xs text-red-500 line-through">
              {item.correction.original}
            </Text>
            <Text className="text-xs text-emerald-600 font-semibold mt-0.5">
              ➜ {item.correction.corrected}
            </Text>
            <Text className="text-xs text-slate-600 mt-1 italic">
              {item.correction.explanationVi}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        {/* Header gia sư */}
        <View className="bg-white px-4 py-3 border-b border-slate-100 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Text className="text-xl">🤖</Text>
            </View>
            <View>
              <Text className="font-bold text-slate-800 text-base">LinguTutor AI</Text>
              <Text className="text-xs text-emerald-600 font-medium">Đang sẵn sàng • {currentLevel}</Text>
            </View>
          </View>
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-blue-600 text-xs font-semibold">{targetLanguage}</Text>
          </View>
        </View>

        {/* Danh sách tin nhắn */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Trạng thái AI đang suy nghĩ */}
        {isTyping && (
          <View className="flex-row items-center px-4 py-2 self-start">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="text-xs text-slate-400 ml-2 italic">LinguTutor đang soạn phản hồi...</Text>
          </View>
        )}

        {/* Thông báo lỗi nếu có */}
        {error && (
          <View className="bg-red-50 p-2 mx-4 rounded-xl border border-red-200">
            <Text className="text-xs text-red-600 text-center">{error}</Text>
          </View>
        )}

        {/* Input gửi tin nhắn */}
        <View className="p-3 bg-white border-t border-slate-100 flex-row items-center">
          <TextInput
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-slate-800 text-sm mr-2 max-h-24"
            placeholder="Nhập câu tiếng Anh bạn muốn nói..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              !inputText.trim() || isTyping ? "bg-slate-300" : "bg-blue-600 shadow-md shadow-blue-200"
            }`}
          >
            <Text className="text-white font-bold text-lg">➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

