import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useQuizStore } from "../../store/useQuizStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/common/Button";

export const QuizScreen = () => {
  const {
    quizData,
    currentIndex,
    userAnswers,
    score,
    isFinished,
    isLoading,
    error,
    fetchQuiz,
    selectAnswer,
    nextQuestion,
    resetQuiz,
  } = useQuizStore();

  const { currentLevel } = useAuthStore();

  useEffect(() => {
    if (!quizData && !isLoading) {
      fetchQuiz("Ngữ pháp & Giao tiếp tổng hợp", currentLevel);
    }
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-base font-bold text-slate-800 mt-4">
          AI đang tạo bộ câu hỏi thích ứng...
        </Text>
        <Text className="text-xs text-slate-500 mt-1 text-center">
          Dựa trên trình độ {currentLevel} của bạn để cá nhân hóa nội dung.
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !quizData?.questions?.length) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Text className="text-base font-bold text-red-600 mb-2">Đã có lỗi xảy ra</Text>
        <Text className="text-sm text-slate-500 text-center mb-4">
          {error || "Không thể tạo bài tập trắc nghiệm."}
        </Text>
        <Button
          title="Tạo lại bài kiểm tra"
          onPress={() => fetchQuiz("Ngữ pháp & Giao tiếp tổng hợp", currentLevel)}
        />
      </SafeAreaView>
    );
  }

  // Màn hình kết quả khi hoàn thành bài quiz
  if (isFinished) {
    const total = quizData.questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <View className="bg-white w-full rounded-3xl p-6 items-center shadow-sm border border-slate-100">
          <Text className="text-5xl mb-3">{percentage >= 70 ? "🎉" : "💪"}</Text>
          <Text className="text-2xl font-bold text-slate-800 mb-1">Hoàn thành bài tập!</Text>
          <Text className="text-sm text-slate-500 mb-6">
            Bạn đã trả lời đúng {score}/{total} câu ({percentage}%)
          </Text>

          <View className="w-full bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Đánh giá từ AI
            </Text>
            <Text className="text-sm text-slate-700 leading-relaxed">
              {percentage >= 80
                ? "Xuất sắc! Bạn nắm rất vững cấu trúc ngữ pháp này. Hãy thử sức ở cấp độ cao hơn."
                : "Rất tốt! Bạn chỉ cần ôn tập thêm một số trường hợp ngoại lệ để phản xạ nhanh hơn."}
            </Text>
          </View>

          <Button
            title="Làm bài tập mới"
            variant="primary"
            size="lg"
            className="w-full mb-3"
            onPress={() => fetchQuiz("Ngữ pháp & Giao tiếp tổng hợp", currentLevel)}
          />
          <Button
            title="Xem lại câu hỏi"
            variant="outline"
            size="md"
            className="w-full"
            onPress={resetQuiz}
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = quizData.questions[currentIndex];
  const selectedOption = userAnswers[currentIndex];
  const hasAnswered = selectedOption !== undefined;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Header tiến trình */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            CÂU HỎI {currentIndex + 1} / {quizData.questions.length}
          </Text>
          <Text className="text-xs font-semibold text-slate-500">
            Điểm hiện tại: {score}
          </Text>
        </View>

        {/* Nội dung câu hỏi */}
        <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-5">
          <Text className="text-lg font-bold text-slate-800 leading-snug">
            {currentQ.question}
          </Text>
        </View>

        {/* Các đáp án lựa chọn A, B, C, D */}
        <View className="space-y-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswerIndex;

            let buttonStyle = "bg-white border-slate-200";
            let textStyle = "text-slate-700";

            if (hasAnswered) {
              if (isCorrect) {
                buttonStyle = "bg-emerald-50 border-emerald-500";
                textStyle = "text-emerald-700 font-bold";
              } else if (isSelected && !isCorrect) {
                buttonStyle = "bg-red-50 border-red-500";
                textStyle = "text-red-700 font-bold";
              }
            } else if (isSelected) {
              buttonStyle = "bg-blue-50 border-blue-600";
              textStyle = "text-blue-600 font-bold";
            }

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                disabled={hasAnswered}
                onPress={() => selectAnswer(currentIndex, idx)}
                className={`p-4 rounded-2xl border-2 flex-row items-center mb-3 shadow-xs ${buttonStyle}`}
              >
                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                  <Text className="font-bold text-slate-600 text-xs">
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text className={`flex-1 text-base ${textStyle}`}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Phần giải thích chi tiết sau khi trả lời */}
        {hasAnswered && (
          <View className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 mb-6">
            <Text className="text-xs font-bold text-blue-700 uppercase mb-1">
              💡 Giải thích từ AI:
            </Text>
            <Text className="text-sm text-slate-700 leading-relaxed">
              {currentQ.explanation}
            </Text>
          </View>
        )}

        {/* Nút Tiếp tục */}
        {hasAnswered && (
          <Button
            title={
              currentIndex === quizData.questions.length - 1
                ? "Xem kết quả bài tập"
                : "Câu tiếp theo ➔"
            }
            variant="primary"
            size="lg"
            className="w-full mb-10 shadow-md shadow-blue-200"
            onPress={nextQuestion}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

