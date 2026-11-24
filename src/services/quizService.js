import { database } from "./firebaseConfig";
import { ref, push, set } from "firebase/database";

const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * 1. Sinh bài tập trắc nghiệm thích ứng theo năng lực học viên bằng Gemini 2.5 Flash
 * 
 * @param {string} targetLanguage - Ngôn ngữ học (mặc định: 'English')
 * @param {string} level - Cấp độ CEFR hiện tại ('A1', 'A2', 'B1', 'B2', 'C1')
 * @param {string} topic - Chủ đề bài kiểm tra ('Grammar & Vocabulary', 'Travel', 'Work'...)
 * @param {Array} mistakesContext - Danh sách lỗi học viên từng mắc phải trong lúc chat
 * @param {number} numQuestions - Số lượng câu hỏi cần sinh (mặc định: 5)
 * @returns {Promise<Array<{ id: string, question: string, options: string[], correctIndex: number, explanation: string }>>}
 */
export const generateAdaptiveQuiz = async (
  targetLanguage = "English",
  level = "B1",
  topic = "Grammar & Vocabulary",
  mistakesContext = [],
  numQuestions = 5
) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  // Dữ liệu dự phòng nếu chưa cấu hình API Key
  if (!apiKey) {
    console.warn("Chưa cấu hình EXPO_PUBLIC_GEMINI_API_KEY trong .env! Trả về bộ câu hỏi demo.");
    const mockQuestions = [
      {
        id: "q1",
        question: "She _____ to the gym three times a week.",
        options: ["goes", "go", "going", "gone"],
        correctIndex: 0,
        explanation: "Chủ ngữ ngôi thứ ba số ít 'She' ở thì hiện tại đơn đi kèm động từ thêm -es (goes).",
      },
      {
        id: "q2",
        question: "If I _____ you, I would take that opportunity immediately.",
        options: ["was", "were", "am", "have been"],
        correctIndex: 1,
        explanation: "Câu điều kiện loại 2 diễn tả giả định không có thật ở hiện tại, dùng 'were' cho tất cả các ngôi.",
      },
      {
        id: "q3",
        question: "They have been living in this city _____ 2018.",
        options: ["for", "since", "during", "in"],
        correctIndex: 1,
        explanation: "'Since' đi kèm với một mốc thời gian cụ thể (2018) trong thì hiện tại hoàn thành tiếp diễn.",
      },
      {
        id: "q4",
        question: "I look forward to _____ from you soon.",
        options: ["hear", "hearing", "heard", "be heard"],
        correctIndex: 1,
        explanation: "Cụm 'look forward to' đi kèm danh động từ (V-ing): hearing.",
      },
      {
        id: "q5",
        question: "Could you please tell me where _____?",
        options: ["the station is", "is the station", "station is", "is station"],
        correctIndex: 0,
        explanation: "Trong câu hỏi gián tiếp (embedded question), mệnh đề sau từ để hỏi giữ trật tự S + V (the station is).",
      },
    ];

    mockQuestions.questions = mockQuestions;
    mockQuestions.topic = topic;
    mockQuestions.level = level;
    return mockQuestions;
  }

  // Xử lý ngữ cảnh các lỗi người dùng từng mắc phải để AI cá nhân hóa câu hỏi
  let mistakesPrompt = "";
  if (Array.isArray(mistakesContext) && mistakesContext.length > 0) {
    const formattedMistakes = mistakesContext
      .map((item, index) => {
        if (typeof item === "string") return `${index + 1}. ${item}`;
        const orig = item.original || item.text || "";
        const corr = item.corrected || item.correctedGrammar || "";
        const exp = item.explanation || "";
        return `${index + 1}. Câu học viên sai: "${orig}" ➔ Nên dùng: "${corr}" (${exp})`;
      })
      .join("\n");

    mistakesPrompt = `
LƯU Ý ĐẶC BIỆT VỀ CÁC LỖI HỌC VIÊN TỪNG MẮC PHẢI:
${formattedMistakes}
Hãy tạo các câu hỏi trắc nghiệm tập trung trực tiếp vào việc củng cố và kiểm tra lại những điểm yếu ngữ pháp/từ vựng trên của học viên.
`;
  }

  const systemInstructionText = `
Bạn là chuyên gia khảo thí ngôn ngữ và sư phạm trong ứng dụng học ngoại ngữ LinguLearn.
Nhiệm vụ: Tạo ${numQuestions} câu hỏi trắc nghiệm tiếng ${targetLanguage} thích ứng phù hợp năng lực học viên:
- Trình độ chuẩn CEFR: ${level}
- Chủ đề: ${topic}
${mistakesPrompt}

YÊU CẦU ĐỊNH DẠNG BẮT BUỘC:
Trả về DUY NHẤT một chuỗi JSON hợp lệ với cấu trúc đối tượng chứa mảng "questions", không kèm bất kỳ ký tự nào khác bên ngoài:
{
  "questions": [
    {
      "id": "q1",
      "question": "Nội dung câu hỏi (bằng ${targetLanguage}, điền vào chỗ trống hoặc chọn câu diễn đạt đúng nhất)",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctIndex": 0,
      "explanation": "Giải thích ngắn gọn bằng tiếng Việt lý do chọn đáp án này và quy tắc ngữ pháp liên quan"
    }
  ]
}
`.trim();

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Hãy tạo đề trắc nghiệm ${numQuestions} câu tiếng ${targetLanguage} cấp độ ${level} cho chủ đề "${topic}".`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  };

  try {
    const response = await fetch(`${GEMINI_API_BASE_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message ||
          `Lỗi từ Gemini API khi sinh câu hỏi (Mã HTTP: ${response.status})`
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Không nhận được dữ liệu câu hỏi từ Gemini.");
    }

    const cleanJson = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanJson);
    const questionsArray = Array.isArray(parsed)
      ? parsed
      : parsed.questions || [];

    // Gán thêm thuộc tính để tương thích linh hoạt với cả 2 cách lấy dữ liệu (Array hoặc .questions)
    questionsArray.questions = questionsArray;
    questionsArray.topic = topic;
    questionsArray.level = level;

    return questionsArray;
  } catch (error) {
    console.error("Lỗi trong generateAdaptiveQuiz:", error);
    throw error;
  }
};

/**
 * 2. Lưu kết quả bài tập trắc nghiệm vào Firebase Realtime Database
 * Nhánh lưu trữ: exercises/${uid}
 * 
 * @param {string} uid - ID người dùng (Firebase Auth UID)
 * @param {object} resultData - Dữ liệu kết quả làm bài
 * @param {string} [resultData.type='adaptive_quiz'] - Loại bài tập
 * @param {string} [resultData.targetLanguage='English'] - Ngôn ngữ làm bài
 * @param {string} [resultData.level='B1'] - Cấp độ CEFR
 * @param {string} [resultData.topic='Grammar & Vocabulary'] - Chủ đề
 * @param {number} resultData.score - Số câu trả lời đúng
 * @param {number} resultData.totalQuestions - Tổng số câu hỏi
 * @param {object} [resultData.answers] - Chi tiết câu trả lời của học viên
 * @returns {Promise<object>} Dữ liệu kết quả đã lưu kèm ID tự sinh từ Firebase
 */
export const saveQuizResult = async (uid, resultData) => {
  try {
    if (!uid) {
      throw new Error("Thiếu tham số 'uid' khi lưu kết quả bài tập.");
    }

    const exercisesRef = ref(database, `exercises/${uid}`);
    const newExerciseRef = push(exercisesRef);

    const payload = {
      type: resultData.type || "adaptive_quiz",
      targetLanguage: resultData.targetLanguage || "English",
      level: resultData.level || "B1",
      topic: resultData.topic || "Grammar & Vocabulary",
      score: typeof resultData.score === "number" ? resultData.score : 0,
      totalQuestions:
        typeof resultData.totalQuestions === "number"
          ? resultData.totalQuestions
          : 5,
      timestamp: Date.now(),
      ...(resultData.answers ? { answers: resultData.answers } : {}),
    };

    await set(newExerciseRef, payload);

    return {
      id: newExerciseRef.key,
      ...payload,
    };
  } catch (error) {
    console.error("Lỗi khi lưu kết quả bài tập (saveQuizResult):", error);
    throw error;
  }
};

