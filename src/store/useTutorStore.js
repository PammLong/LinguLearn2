import { create } from "zustand";
import { chatWithAITutor } from "../services/llmService";
import { saveMessageToRealtime } from "../services/firebaseConfig";

export const useTutorStore = create((set, get) => ({
  messages: [
    {
      id: "welcome",
      role: "model",
      text: "Xin chào! Mình là LinguTutor, gia sư AI của bạn. Hôm nay bạn muốn luyện tập về chủ đề gì?",
      correction: null,
      timestamp: Date.now(),
    },
  ],
  isTyping: false,
  error: null,

  sendMessage: async (userText, userId = "anonymous", targetLanguage = "Tiếng Anh", userLevel = "B1") => {
    if (!userText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    try {
      // Lưu tin nhắn user vào Firebase Realtime nếu có user ID
      if (userId && userId !== "anonymous") {
        saveMessageToRealtime(userId, userMessage).catch(console.warn);
      }

      // Chuẩn bị history cho Gemini
      const history = get().messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      // Gọi API LLM Gemini
      const response = await chatWithAITutor({
        history,
        userMessage: userText,
        targetLanguage,
        userLevel,
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.tutorResponse,
        correction: response.hasGrammarMistake ? response.correction : null,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isTyping: false,
      }));

      // Lưu tin nhắn AI vào Firebase
      if (userId && userId !== "anonymous") {
        saveMessageToRealtime(userId, aiMessage).catch(console.warn);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      set({
        isTyping: false,
        error: "Không thể kết nối đến gia sư AI. Vui lòng thử lại!",
      });
    }
  },

  clearChat: () =>
    set({
      messages: [
        {
          id: "welcome",
          role: "model",
          text: "Xin chào! Chúng ta bắt đầu phiên học mới nhé!",
          correction: null,
          timestamp: Date.now(),
        },
      ],
    }),
}));

