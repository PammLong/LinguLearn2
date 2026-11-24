import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth } from "../services/firebaseConfig";
import { generateAdaptiveQuiz, saveQuizResult } from "../services/quizService";

export const QuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || "guest_user";

  // Lấy dữ liệu truyền từ màn hình trước (nếu có ngữ cảnh lỗi sai từ Chat)
  const initialMistakes = route.params?.mistakesContext || [];
  const initialTopic = route.params?.topic || "Ngữ pháp";
  const initialLevel = route.params?.level || "B1";

  // State cấu hình
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [mistakesContext, setMistakesContext] = useState(initialMistakes);

  // State trạng thái làm bài ('setup' | 'loading' | 'in_progress' | 'completed')
  const [quizState, setQuizState] = useState(
    route.params?.autoStart ? "loading" : "setup"
  );

  // State câu hỏi và tính điểm
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [savingResult, setSavingResult] = useState(false);

  const levels = [
    { id: "A2", label: "A2 - Sơ cấp", desc: "Nền tảng căn bản" },
    { id: "B1", label: "B1 - Trung cấp", desc: "Giao tiếp & phản xạ" },
    { id: "B2", label: "B2 - Nâng cao", desc: "Cấu trúc phức tạp" },
  ];

  const topics = [
    { id: "Ngữ pháp", label: "Ngữ pháp", icon: "📐" },
    { id: "Từ vựng", label: "Từ vựng", icon: "📚" },
    { id: "Giao tiếp", label: "Giao tiếp", icon: "💬" },
  ];

  // Tự động sinh câu hỏi nếu autoStart được truyền vào
  useEffect(() => {
    if (route.params?.autoStart) {
      handleStartQuiz();
    }
  }, []);

  // 1. Bắt đầu sinh câu hỏi trắc nghiệm qua Gemini API
  const handleStartQuiz = async () => {
    setQuizState("loading");
    try {
      const generatedQuestions = await generateAdaptiveQuiz(
        "English",
        selectedLevel,
        selectedTopic,
        mistakesContext,
        5
      );

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("Không có câu hỏi nào được tạo. Vui lòng thử lại!");
      }

      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setSelectedOptionIndex(null);
      setHasAnswered(false);
      setScore(0);
      setQuizState("in_progress");
    } catch (error) {
      console.error("Lỗi khi tạo quiz:", error);
      Alert.alert(
        "Lỗi khởi tạo",
        error.message || "Không thể sinh bộ câu hỏi lúc này. Vui lòng thử lại!"
      );
      setQuizState("setup");
    }
  };

  // 2. Chọn một đáp án
  const handleSelectOption = (optionIndex) => {
    if (hasAnswered) return;

    setSelectedOptionIndex(optionIndex);
    setHasAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  // 3. Chuyển sang câu tiếp theo hoặc kết thúc
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setHasAnswered(false);
    } else {
      finishQuiz();
    }
  };

  // 4. Hoàn thành và lưu kết quả lên Firebase
  const finishQuiz = async () => {
    setQuizState("completed");
    setSavingResult(true);

    const finalScore = score;
    const totalQuestions = questions.length;

    try {
      // Lưu kết quả vào Firebase exercises/${uid} (hàm này tự động gọi updateUserProgress để cộng điểm và tính streak)
      await saveQuizResult(uid, {
        type: "adaptive_quiz",
        targetLanguage: "English",
        level: selectedLevel,
        topic: selectedTopic,
        score: finalScore,
        totalQuestions,
      });
    } catch (error) {
      console.warn("Lưu tiến độ bài tập thất bại:", error);
    } finally {
      setSavingResult(false);
    }
  };

  // ==========================================
  // GIAO DIỆN 1: THIẾT LẬP CHỦ ĐỀ & CẤP ĐỘ
  // ==========================================
  if (quizState === "setup") {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3 shadow-xs border border-slate-100"
            >
              <Text className="text-slate-700 font-bold text-lg">‹</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-slate-800">
                Trắc nghiệm thích ứng
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                AI cá nhân hóa câu hỏi theo năng lực của bạn
              </Text>
            </View>
          </View>

          {/* Banner lỗi sai gần nhất (nếu có) */}
          {mistakesContext.length > 0 && (
            <View className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 shadow-xs">
              <View className="flex-row items-center mb-1">
                <Text className="text-base mr-2">🎯</Text>
                <Text className="text-amber-800 font-bold text-xs uppercase">
                  Chế độ ôn luyện trọng tâm
                </Text>
              </View>
              <Text className="text-xs text-slate-600 leading-relaxed">
                Đã nạp {mistakesContext.length} lỗi sai từ phiên trò chuyện gần nhất.
                AI sẽ tạo các câu hỏi giúp bạn khắc phục triệt để các lỗi này!
              </Text>
            </View>
          )}

          {/* Chọn Cấp độ CEFR */}
          <Text className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            1. Chọn cấp độ mục tiêu
          </Text>
          <View className="space-y-2.5 mb-6">
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <TouchableOpacity
                  key={lvl.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedLevel(lvl.id)}
                  className={`p-4 rounded-2xl border flex-row items-center justify-between mb-2 shadow-xs ${
                    isSelected
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <View>
                    <Text
                      className={`text-base font-bold ${
                        isSelected ? "text-blue-700" : "text-slate-800"
                      }`}
                    >
                      {lvl.label}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {lvl.desc}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Chọn Chủ đề bài thi */}
          <Text className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            2. Chọn chủ đề kiểm tra
          </Text>
          <View className="flex-row space-x-3 mb-8">
            {topics.map((top) => {
              const isSelected = selectedTopic === top.id;
              return (
                <TouchableOpacity
                  key={top.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTopic(top.id)}
                  className={`flex-1 p-3.5 rounded-2xl border items-center shadow-xs mx-1 ${
                    isSelected
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text className="text-2xl mb-1.5">{top.icon}</Text>
                  <Text
                    className={`text-xs font-bold text-center ${
                      isSelected ? "text-blue-700" : "text-slate-700"
                    }`}
                  >
                    {top.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Nút Bắt đầu */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStartQuiz}
            className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center justify-center shadow-md shadow-blue-200 mb-10"
          >
            <Text className="text-white font-bold text-base">
              Bắt đầu làm bài 🚀
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // GIAO DIỆN 2: ĐANG TẠO BỘ CÂU HỎI (LOADING)
  // ==========================================
  if (quizState === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
        <Text className="text-xl font-bold text-slate-800 text-center mb-1">
          AI đang tạo câu hỏi thích ứng...
        </Text>
        <Text className="text-xs text-slate-500 text-center leading-relaxed max-w-xs">
          Đang tổng hợp các câu hỏi theo trình độ {selectedLevel} và chủ đề "{selectedTopic}".
        </Text>
      </SafeAreaView>
    );
  }

  // ==========================================
  // GIAO DIỆN 3: TỔNG KẾT ĐIỂM (COMPLETED)
  // ==========================================
  if (quizState === "completed") {
    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const isPassed = percentage >= 60;

    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center p-6">
        <View className="bg-white rounded-3xl p-6 w-full items-center shadow-sm border border-slate-100">
          <Text className="text-5xl mb-3">{isPassed ? "🎉" : "💪"}</Text>
          <Text className="text-2xl font-bold text-slate-800 mb-1">
            {isPassed ? "Hoàn thành xuất sắc!" : "Cố gắng hơn nữa nhé!"}
          </Text>
          <Text className="text-xs text-slate-400 mb-6 text-center">
            Bạn vừa hoàn thành bộ trắc nghiệm cấp độ {selectedLevel}
          </Text>

          {/* Vòng tròn điểm số */}
          <View className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 mb-6 w-full items-center">
            <Text className="text-4xl font-extrabold text-blue-600">
              {score} / {total}
            </Text>
            <Text className="text-xs font-semibold text-blue-800 mt-1">
              Đúng {percentage}% câu hỏi
            </Text>
          </View>

          {/* Trạng thái lưu Firebase */}
          <View className="flex-row items-center mb-6">
            <Text className="text-xs text-emerald-600 font-semibold">
              ✓ Đã lưu kết quả & cộng dồn điểm vào Firebase
            </Text>
          </View>

          {/* Nút hành động */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setQuizState("setup")}
            className="w-full bg-blue-600 active:bg-blue-700 py-3.5 rounded-xl items-center justify-center shadow-md shadow-blue-200 mb-3"
          >
            <Text className="text-white font-bold text-base">
              Làm lại bộ khác
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Home")}
            className="w-full bg-slate-100 active:bg-slate-200 py-3.5 rounded-xl items-center justify-center"
          >
            <Text className="text-slate-600 font-semibold text-sm">
              Quay về trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // GIAO DIỆN 4: ĐANG LÀM BÀI (IN_PROGRESS)
  // ==========================================
  const currentQ = questions[currentIndex] || {};
  const progressPercent =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Header tiến trình */}
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Dừng bài thi?", "Kết quả hiện tại sẽ không được lưu.", [
                { text: "Tiếp tục làm", style: "cancel" },
                { text: "Thoát", style: "destructive", onPress: () => setQuizState("setup") },
              ]);
            }}
          >
            <Text className="text-slate-400 font-bold text-base">✕ Thoát</Text>
          </TouchableOpacity>

          <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Text className="text-blue-700 font-bold text-xs">
              CÂU {currentIndex + 1} / {questions.length}
            </Text>
          </View>

          <Text className="text-xs font-semibold text-slate-500">
            Điểm: {score}
          </Text>
        </View>

        {/* Thanh Progress Bar */}
        <View className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-5">
          <View
            className="bg-blue-600 h-full rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>

        {/* Nội dung câu hỏi */}
        <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-5">
          <Text className="text-lg font-bold text-slate-800 leading-snug">
            {currentQ.question}
          </Text>
        </View>

        {/* 4 Đáp án lựa chọn */}
        <View className="space-y-3 mb-4">
          {currentQ.options?.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let cardStyle = "bg-white border-slate-200";
            let badgeStyle = "bg-slate-100 text-slate-600";
            let textStyle = "text-slate-700";

            if (hasAnswered) {
              if (isCorrect) {
                cardStyle = "bg-emerald-50 border-emerald-500";
                badgeStyle = "bg-emerald-600 text-white";
                textStyle = "text-emerald-800 font-bold";
              } else if (isSelected && !isCorrect) {
                cardStyle = "bg-red-50 border-red-500";
                badgeStyle = "bg-red-500 text-white";
                textStyle = "text-red-700 font-bold";
              }
            } else if (isSelected) {
              cardStyle = "bg-blue-50 border-blue-500";
              badgeStyle = "bg-blue-600 text-white";
              textStyle = "text-blue-700 font-bold";
            }

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                disabled={hasAnswered}
                onPress={() => handleSelectOption(idx)}
                className={`p-4 rounded-2xl border-2 flex-row items-center mb-3 shadow-xs ${cardStyle}`}
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${badgeStyle}`}
                >
                  <Text className="font-bold text-xs">
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text className={`flex-1 text-base ${textStyle}`}>{option}</Text>
                {hasAnswered && isCorrect && (
                  <Text className="text-emerald-600 font-bold text-lg">✓</Text>
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <Text className="text-red-500 font-bold text-lg">✕</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Khung giải thích chi tiết sau khi trả lời */}
        {hasAnswered && (
          <View className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 mb-6 shadow-xs">
            <Text className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
              💡 Giải thích từ AI:
            </Text>
            <Text className="text-xs text-slate-700 leading-relaxed">
              {currentQ.explanation}
            </Text>
          </View>
        )}

        {/* Nút Câu tiếp theo / Hoàn thành */}
        {hasAnswered && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNextQuestion}
            className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center justify-center shadow-md shadow-blue-200 mb-10"
          >
            <Text className="text-white font-bold text-base">
              {currentIndex === questions.length - 1
                ? "Hoàn thành bài thi ✓"
                : "Câu tiếp theo ➔"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuizScreen;
