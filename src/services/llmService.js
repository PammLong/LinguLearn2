import { GoogleGenerativeAI } from "@google/generative-ai";

// Lấy API Key từ biến môi trường
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Khởi tạo model Gemini (sử dụng gemini-1.5-flash để phản hồi nhanh và chi phí tối ưu trên mobile)
const getModel = (modelName = "gemini-1.5-flash") => {
  if (!genAI) {
    console.warn("Cảnh báo: Chưa cấu hình EXPO_PUBLIC_GEMINI_API_KEY trong file .env!");
    return null;
  }
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Trợ giúp phân tích chuỗi JSON trả về từ LLM (bóc tách markdown block nếu có)
 */
const extractJsonFromResponse = (text) => {
  try {
    const cleanedText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Lỗi parse JSON từ Gemini:", error, "\nRaw text:", text);
    throw new Error("Không thể định dạng dữ liệu từ AI. Vui lòng thử lại!");
  }
};

/**
 * 1. Giao tiếp với gia sư AI (AI Language Tutor)
 * Trò chuyện tự nhiên, kèm gợi ý sửa lỗi ngữ pháp nếu người học viết sai.
 * @param {Array} history - Danh sách hội thoại trước đó [{ role: 'user' | 'model', parts: [{ text }] }]
 * @param {string} userMessage - Tin nhắn của người học
 * @param {string} targetLanguage - Ngôn ngữ đang học (ví dụ: "Tiếng Anh")
 * @param {string} userLevel - Cấp độ người học (ví dụ: "A2 - Sơ cấp")
 */
export const chatWithAITutor = async ({
  history = [],
  userMessage,
  targetLanguage = "Tiếng Anh",
  userLevel = "B1",
}) => {
  const model = getModel();

  if (!model) {
    // Phản hồi giả lập nếu chưa có API Key để test UI
    return {
      tutorResponse: `[Demo] Chào bạn! Tôi là gia sư ảo LinguLearn. Bạn vừa nói: "${userMessage}". Hãy thêm EXPO_PUBLIC_GEMINI_API_KEY vào .env để kích hoạt AI thực tế nhé!`,
      correction: null,
    };
  }

  const systemInstruction = `
Bạn là gia sư AI dạy ngoại ngữ thân thiện, nhiệt huyết tên là "LinguTutor" trong ứng dụng "LinguLearn".
- Ngôn ngữ đang dạy: ${targetLanguage}.
- Trình độ của học viên: ${userLevel}.
- Nhiệm vụ:
  1. Trả lời học viên bằng giọng văn tự nhiên, khuyến khích trò chuyện, đặt thêm 1 câu hỏi mở để tiếp tục hội thoại.
  2. Kiểm tra ngữ pháp và từ vựng câu học viên vừa gửi. Nếu có lỗi, giải thích ngắn gọn, dễ hiểu bằng tiếng Việt và đưa ra câu sửa chuẩn xác.
- ĐỊNH DẠNG TRẢ VỀ: BẮT BUỘC trả về duy nhất 1 JSON object (không kèm markdown bên ngoài):
{
  "tutorResponse": "câu trả lời của bạn gửi cho học viên bằng ngôn ngữ học viên đang học",
  "hasGrammarMistake": true/false,
  "correction": {
    "original": "phần sai của học viên",
    "corrected": "cách viết chuẩn xác",
    "explanationVi": "giải thích chi tiết bằng tiếng Việt"
  } // hoặc null nếu học viên viết đúng hoàn toàn
}
`;

  try {
    const chat = model.startChat({
      history: history.map((item) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.text }],
      })),
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const prompt = `${systemInstruction}\n\nTin nhắn người học: "${userMessage}"`;
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    return extractJsonFromResponse(responseText);
  } catch (error) {
    console.error("Lỗi chatWithAITutor:", error);
    throw error;
  }
};

/**
 * 2. Phân tích ngữ pháp chuyên sâu (Grammar Correction Tool)
 * Phân tích một câu cụ thể, chỉ ra cấu trúc ngữ pháp và từ vựng thay thế tự nhiên hơn.
 * @param {string} sentence - Câu người dùng nhập
 * @param {string} targetLanguage - Ngôn ngữ mục tiêu
 */
export const analyzeAndCorrectGrammar = async (
  sentence,
  targetLanguage = "Tiếng Anh"
) => {
  const model = getModel();

  if (!model) {
    return {
      isCorrect: true,
      originalSentence: sentence,
      correctedSentence: sentence,
      explanation: "Vui lòng cấu hình EXPO_PUBLIC_GEMINI_API_KEY để kiểm tra ngữ pháp thực tế.",
      betterAlternatives: [],
    };
  }

  const prompt = `
Hãy đóng vai chuyên gia ngôn ngữ học. Hãy phân tích ngữ pháp cho câu sau trong ${targetLanguage}:
"${sentence}"

Yêu cầu trả về duy nhất định dạng JSON:
{
  "isCorrect": true/false,
  "originalSentence": "${sentence}",
  "correctedSentence": "câu đã được sửa đúng hoàn toàn",
  "explanation": "giải thích chi tiết lỗi sai và quy tắc ngữ pháp bằng tiếng Việt",
  "betterAlternatives": [
    "cách diễn đạt tự nhiên hơn 1 của người bản xứ",
    "cách diễn đạt tự nhiên hơn 2"
  ]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    return extractJsonFromResponse(result.response.text());
  } catch (error) {
    console.error("Lỗi analyzeAndCorrectGrammar:", error);
    throw error;
  }
};

/**
 * 3. Sinh bài tập trắc nghiệm thích ứng theo năng lực (Adaptive Quiz Generator)
 * Tự động tạo câu hỏi trắc nghiệm dựa theo chủ đề và trình độ CEFR.
 * @param {string} topic - Chủ đề bài học (Daily Routine, Travel, Business...)
 * @param {string} level - Cấp độ CEFR (A1, A2, B1, B2, C1)
 * @param {number} numberOfQuestions - Số lượng câu hỏi cần sinh (mặc định 5)
 */
export const generateAdaptiveQuiz = async ({
  topic = "Daily Conversation",
  level = "B1",
  numberOfQuestions = 5,
}) => {
  const model = getModel();

  if (!model) {
    // Dữ liệu mẫu giả lập
    return {
      topic,
      level,
      questions: [
        {
          id: 1,
          question: "She _____ to the gym every morning before work.",
          options: ["go", "goes", "going", "went"],
          correctAnswerIndex: 1,
          explanation: "Chủ ngữ ngôi thứ 3 số ít 'She' ở thì hiện tại đơn đi với động từ thêm -es (goes).",
        },
        {
          id: 2,
          question: "If I _____ more free time, I would learn another language.",
          options: ["have", "had", "will have", "would have"],
          correctAnswerIndex: 1,
          explanation: "Câu điều kiện loại 2 diễn tả giả định trái với hiện tại: If + S + V2/ed, S + would + V.",
        },
      ],
    };
  }

  const prompt = `
Bạn là hệ thống tạo đề thi đánh giá năng lực ngoại ngữ cho ứng dụng LinguLearn.
Hãy tạo ${numberOfQuestions} câu hỏi trắc nghiệm tiếng Anh cho:
- Chủ đề: ${topic}
- Trình độ CEFR: ${level}

Yêu cầu trả về DUY NHẤT một chuỗi JSON hợp lệ với cấu trúc sau:
{
  "topic": "${topic}",
  "level": "${level}",
  "questions": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi trắc nghiệm (điền vào chỗ trống hoặc chọn câu đúng)",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswerIndex": 0, // chỉ số từ 0 đến 3 của đáp án đúng
      "explanation": "Giải thích chi tiết tại sao đúng và quy tắc ngữ pháp liên quan bằng tiếng Việt"
    }
  ]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    return extractJsonFromResponse(result.response.text());
  } catch (error) {
    console.error("Lỗi generateAdaptiveQuiz:", error);
    throw error;
  }
};

