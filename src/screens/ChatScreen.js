import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../services/firebaseConfig";
import { useAuthStore } from "../store/useAuthStore";
import { saveMessage, subscribeToMessages } from "../services/chatService";
import { sendMessageToTutor } from "../services/llmService";
import { updateUserProgress } from "../services/progressService";

export const ChatScreen = (props) => {
  const hookNavigation = useNavigation();
  const hookRoute = useRoute();
  const navigation = props.navigation || hookNavigation;
  const route = props.route || hookRoute;

  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  // 1. Thông tin người dùng & phiên học
  const storeUser = useAuthStore((state) => state.user);
  const currentUser = auth.currentUser || storeUser;
  const uid = currentUser?.uid || route.params?.uid || "guest_user";
  const sessionId = route.params?.sessionId || "default_session";
  const targetLanguage = route.params?.targetLanguage || "English";
  const userLevel = route.params?.level || "B1";

  // 2. State quản lý tin nhắn và trạng thái giao diện
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // 3. Lắng nghe lịch sử tin nhắn thời gian thực từ Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = subscribeToMessages(uid, sessionId, (realtimeMessages) => {
      if (realtimeMessages && realtimeMessages.length > 0) {
        setMessages(realtimeMessages);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [uid, sessionId]);

  // 4. Xử lý gửi tin nhắn của người học và nhận phản hồi từ AI
  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || loadingAi) return;

    // Xóa ô nhập liệu ngay để tối ưu trải nghiệm gõ phím
    setInputText("");

    const userMessageItem = {
      id: "usr_" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: Date.now(),
    };

    // Cập nhật giao diện ngay lập tức
    setMessages((prev) => [...prev, userMessageItem]);

    // Bật trạng thái đang chờ AI phản hồi
    setLoadingAi(true);

    try {
      // 4.1 Lưu tin nhắn người dùng lên Firebase (nếu lỗi quyền thì bỏ qua, app vẫn hoạt động)
      saveMessage(uid, sessionId, {
        role: "user",
        text: textToSend,
        timestamp: userMessageItem.timestamp,
      }).catch((err) => console.warn("Lưu tin nhắn user lên Firebase không thành công:", err));

      // 4.2 Chuẩn bị ngữ cảnh 10 tin nhắn gần nhất cho Gemini
      const recentHistory = messages.slice(-10).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text,
      }));

      // 4.3 Gọi dịch vụ Gemini LLM (gemini-2.5-flash)
      const aiResponse = await sendMessageToTutor(
        textToSend,
        targetLanguage,
        userLevel,
        recentHistory
      );

      const aiMessageItem = {
        id: "ai_" + Date.now(),
        role: "ai",
        text: aiResponse.reply || "I am glad to chat with you!",
        correctedGrammar: aiResponse.correctedGrammar || "",
        explanation: aiResponse.explanation || "",
        timestamp: Date.now(),
      };

      // Cập nhật giao diện tin nhắn của AI
      setMessages((prev) => [...prev, aiMessageItem]);

      // 4.4 Lưu phản hồi của AI vào Firebase (bất đồng bộ)
      saveMessage(uid, sessionId, {
        role: "ai",
        text: aiMessageItem.text,
        correctedGrammar: aiMessageItem.correctedGrammar,
        explanation: aiMessageItem.explanation,
        timestamp: aiMessageItem.timestamp,
      }).catch((err) => console.warn("Lưu tin nhắn AI lên Firebase không thành công:", err));

      // 4.5 Thưởng +5 điểm tích lũy khi tương tác với gia sư AI
      if (uid && !uid.startsWith("guest_")) {
        updateUserProgress(uid, 5).catch((err) =>
          console.warn("Không thể cộng điểm chat:", err)
        );
      }
    } catch (error) {
      console.error("Lỗi quy trình chat:", error);
      Alert.alert(
        "Sự cố kết nối",
        error.message || "Không thể nhận phản hồi từ gia sư AI. Vui lòng kiểm tra lại mạng hoặc API Key!"
      );
    } finally {
      setLoadingAi(false);
    }
  };

  // 5. Render từng bong bóng tin nhắn
  const renderMessageItem = ({ item }) => {
    const isUser = item.role === "user";
    const hasGrammarFeedback =
      !isUser &&
      (Boolean(item.correctedGrammar?.trim()) || Boolean(item.explanation?.trim()));

    // Định dạng giờ hiển thị ngắn gọn (HH:mm)
    const formattedTime = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View
        className={`my-2 max-w-[85%] ${
          isUser ? "self-end items-end" : "self-start items-start"
        }`}
      >
        {/* Bong bóng nội dung chính */}
        <View
          className={`px-4 py-3 rounded-2xl shadow-xs ${
            isUser
              ? "bg-blue-600 rounded-tr-sm"
              : "bg-white border border-slate-200 rounded-tl-sm"
          }`}
        >
          <Text
            className={`text-base leading-relaxed ${
              isUser ? "text-white font-normal" : "text-slate-800 font-normal"
            }`}
          >
            {item.text}
          </Text>
        </View>

        {/* Khung gợi ý sửa lỗi ngữ pháp nổi bật (Dành cho tin nhắn của AI) */}
        {hasGrammarFeedback && (
          <View className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 mt-2 shadow-xs w-full">
            <View className="flex-row items-center mb-1.5">
              <Text className="text-amber-800 font-bold text-xs uppercase tracking-wide">
                💡 Gợi ý chuẩn ngữ pháp
              </Text>
            </View>

            {Boolean(item.correctedGrammar?.trim()) && (
              <View className="mb-1">
                <Text className="text-xs text-slate-500 font-medium">Câu gợi ý tự nhiên hơn:</Text>
                <Text className="text-emerald-700 font-semibold text-sm mt-0.5">
                  ✓ {item.correctedGrammar}
                </Text>
              </View>
            )}

            {Boolean(item.explanation?.trim()) && (
              <View className="mt-1 pt-1 border-t border-amber-200/60">
                <Text className="text-xs text-slate-600 italic leading-relaxed">
                  {item.explanation}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Thời gian gửi tin */}
        {Boolean(formattedTime) && (
          <Text className="text-[10px] text-slate-400 mt-1 px-1">
            {formattedTime}
          </Text>
        )}
      </View>
    );
  };

  const topSafePadding =
    Math.max(
      insets.top,
      Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 20
    ) + 6;

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header màn hình Chat với Safe Area đầy đủ */}
      <View
        style={{ paddingTop: topSafePadding }}
        className="bg-white px-4 pb-3 border-b border-slate-200 flex-row items-center justify-between shadow-xs"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            className="mr-3 w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
          >
            <Text className="text-slate-700 font-bold text-xl leading-none">‹</Text>
          </TouchableOpacity>

          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Text className="text-xl">🤖</Text>
          </View>

          <View>
            <Text className="font-bold text-slate-800 text-base">LinguTutor AI</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              <Text className="text-xs text-slate-500 font-medium">
                {targetLanguage} • Trình độ {userLevel}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          <Text className="text-blue-700 font-semibold text-xs">24/7</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        className="flex-1"
      >
        {/* Danh sách tin nhắn */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id || String(item.timestamp)}
          renderItem={renderMessageItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-start",
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View className="items-center justify-center py-12 px-6">
              <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-3">
                <Text className="text-3xl">💬</Text>
              </View>
              <Text className="text-base font-bold text-slate-700 text-center">
                Bắt đầu hội thoại với LinguTutor!
              </Text>
              <Text className="text-xs text-slate-400 text-center mt-1 leading-relaxed">
                Hãy gửi một câu tiếng Anh bất kỳ. Gia sư AI sẽ phản hồi tự nhiên và gợi ý sửa ngữ pháp chi tiết cho bạn.
              </Text>
            </View>
          }
        />

        {/* Loading khi gia sư AI đang suy nghĩ */}
        {loadingAi && (
          <View className="flex-row items-center px-4 py-2 self-start bg-slate-100 rounded-full mx-4 mb-2">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="text-xs text-slate-500 font-medium ml-2 italic">
              LinguTutor đang phản hồi...
            </Text>
          </View>
        )}

        {/* Thanh nhập liệu (Input Bar) */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="p-3 bg-white border-t border-slate-200 flex-row items-center"
        >
          <TextInput
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-slate-800 text-sm mr-2 max-h-24"
            placeholder={`Nói gì đó bằng ${targetLanguage}...`}
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="default"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || loadingAi}
            className="w-11 h-11 rounded-2xl items-center justify-center bg-blue-600"
            style={{ opacity: !inputText.trim() || loadingAi ? 0.4 : 1 }}
          >
            {loadingAi ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
