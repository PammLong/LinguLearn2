import { create } from "zustand";
import { generateAdaptiveQuiz } from "../services/llmService";
import { saveQuizResultToRealtime } from "../services/firebaseConfig";

export const useQuizStore = create((set, get) => ({
  quizData: null,
  currentIndex: 0,
  userAnswers: {},
  score: 0,
  isFinished: false,
  isLoading: false,
  error: null,

  fetchQuiz: async (topic = "Daily Routine", level = "B1") => {
    set({ isLoading: true, error: null, isFinished: false, currentIndex: 0, userAnswers: {}, score: 0 });
    try {
      const data = await generateAdaptiveQuiz({ topic, level, numberOfQuestions: 5 });
      set({ quizData: data, isLoading: false });
    } catch (err) {
      console.error("Lỗi tải quiz:", err);
      set({ isLoading: false, error: "Không thể tạo bài tập trắc nghiệm lúc này." });
    }
  },

  selectAnswer: (questionIndex, selectedOptionIndex) => {
    const { userAnswers, quizData } = get();
    const updatedAnswers = { ...userAnswers, [questionIndex]: selectedOptionIndex };
    
    // Tính lại điểm
    let newScore = 0;
    if (quizData && quizData.questions) {
      quizData.questions.forEach((q, idx) => {
        if (updatedAnswers[idx] === q.correctAnswerIndex) {
          newScore += 1;
        }
      });
    }

    set({ userAnswers: updatedAnswers, score: newScore });
  },

  nextQuestion: () => {
    const { currentIndex, quizData } = get();
    if (quizData && currentIndex < quizData.questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else {
      set({ isFinished: true });
    }
  },

  finishQuiz: async (userId = "anonymous") => {
    const { quizData, score, userAnswers } = get();
    set({ isFinished: true });

    if (userId && userId !== "anonymous" && quizData) {
      const resultData = {
        topic: quizData.topic,
        level: quizData.level,
        score,
        totalQuestions: quizData.questions.length,
        answers: userAnswers,
      };
      saveQuizResultToRealtime(userId, resultData).catch(console.warn);
    }
  },

  resetQuiz: () => {
    set({
      quizData: null,
      currentIndex: 0,
      userAnswers: {},
      score: 0,
      isFinished: false,
      isLoading: false,
      error: null,
    });
  },
}));

