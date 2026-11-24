/**
 * Dịch vụ giao tiếp với Google Gemini LLM API cho ứng dụng LinguLearn
 * Sử dụng fetch gọi trực tiếp REST API của mô hình gemini-2.5-flash
 */

const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * 1. Gửi tin nhắn trò chuyện với Gia sư AI (LinguTutor)
 * @param {string|object} userMessage - Tin nhắn từ người dùng (hoặc object config)
 * @param {string} targetLanguage - Ngôn ngữ đang học (mặc định: 'English')
 * @param {string} level - Trình độ CEFR của học viên (mặc định: 'B1')
 * @param {Array} chatHistory - Lịch sử hội thoại trước đó [{ role: 'user'|'model', text: '...' }]
 * @returns {Promise<{ reply: string, correctedGrammar: string, explanation: string }>}
 */
export const sendMessageToTutor = async (
  userMessage,
  targetLanguage = "English",
  level = "B1",
  chatHistory = []
) => {
  // Hỗ trợ cả 2 cách gọi: truyền từng tham số hoặc truyền 1 object config
  let actualMessage = userMessage;
  let actualLang = targetLanguage;
  let actualLevel = level;
  let actualHistory = chatHistory;

  if (typeof userMessage === "object" && userMessage !== null) {
    actualMessage = userMessage.userMessage || userMessage.text || "";
    actualLang = userMessage.targetLanguage || targetLanguage;
    actualLevel = userMessage.level || userMessage.userLevel || level;
    actualHistory = userMessage.chatHistory || userMessage.history || chatHistory;
  }

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      "Cảnh báo: Chưa cấu hình EXPO_PUBLIC_GEMINI_API_KEY trong file .env!"
    );
    return {
      reply: `[Demo] Chào bạn! Tôi là gia sư LinguTutor. Bạn vừa nói: "${actualMessage}". Hãy cấu hình EXPO_PUBLIC_GEMINI_API_KEY để trò chuyện cùng AI thực tế nhé!`,
      correctedGrammar: "",
      explanation: "",
    };
  }

  // System Instruction định hình vai trò và ép buộc định dạng JSON
  const systemInstructionText = `
Bạn là "LinguTutor", một gia sư ngoại ngữ AI thân thiện, tận tâm và chuyên nghiệp trong ứng dụng LinguLearn.
- Ngôn ngữ học viên đang học: ${actualLang}.
- Trình độ hiện tại của học viên (CEFR): ${actualLevel}.

Nhiệm vụ của bạn:
1. Trả lời tự nhiên, giao tiếp duy trì hội thoại bằng ${actualLang} sao cho phù hợp với trình độ ${actualLevel}. Hãy đặt thêm 1 câu hỏi mở hoặc gợi ý tình huống để người học hào hứng tiếp tục cuộc trò chuyện.
2. Kiểm tra câu của học viên:
   - Nếu câu của học viên có lỗi sai ngữ pháp, dùng từ chưa chuẩn, hoặc diễn đạt chưa tự nhiên: Hãy viết lại câu đó chuẩn xác và tự nhiên hơn vào trường "correctedGrammar", đồng thời giải thích ngắn gọn, dễ hiểu bằng tiếng Việt vào trường "explanation".
   - Nếu câu của học viên đã đúng hoàn toàn về ngữ pháp và từ vựng: BẮT BUỘC trả về chuỗi rỗng "" cho "correctedGrammar" và chuỗi rỗng "" cho "explanation".

QUY TẮC BẮT BUỘC:
Trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm theo markdown \`\`\`json hoặc bất kỳ ký tự nào khác bên ngoài), tuân theo đúng cấu trúc 3 trường sau:
{
  "reply": "Câu trả lời của bạn tiếp nối câu chuyện bằng ${actualLang}",
  "correctedGrammar": "Câu đã được sửa lại cho đúng và tự nhiên hơn (hoặc chuỗi rỗng \"\" nếu câu gốc đã chuẩn)",
  "explanation": "Giải thích ngắn gọn lỗi ngữ pháp bằng tiếng Việt (hoặc chuỗi rỗng \"\" nếu câu gốc đã chuẩn)"
}
`.trim();

  // Chuẩn bị danh sách contents phù hợp định dạng Gemini REST API
  const formattedContents = [];

  // Nạp lịch sử hội thoại trước đó (nếu có)
  if (Array.isArray(actualHistory) && actualHistory.length > 0) {
    for (const msg of actualHistory) {
      const role =
        msg.role === "model" || msg.role === "assistant" ? "model" : "user";
      const text = msg.text || msg.content || "";
      if (text.trim()) {
        formattedContents.push({
          role,
          parts: [{ text }],
        });
      }
    }
  }

  // Thêm tin nhắn hiện tại của học viên
  formattedContents.push({
    role: "user",
    parts: [{ text: actualMessage }],
  });

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents: formattedContents,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
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
      const errorMsg =
        errorData?.error?.message ||
        `Lỗi từ Gemini API (Mã phản hồi HTTP: ${response.status})`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Không nhận được phản hồi từ mô hình AI.");
    }

    // Làm sạch và bóc tách dữ liệu JSON
    const cleanJson = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedResult = JSON.parse(cleanJson);

    return {
      reply: parsedResult.reply || "",
      correctedGrammar: parsedResult.correctedGrammar || "",
      explanation: parsedResult.explanation || "",
    };
  } catch (error) {
    console.error("Lỗi khi gọi Gemini REST API trong sendMessageToTutor:", error);
    throw error;
  }
};

/**
 * Alias tương thích ngược cho useTutorStore
 */
export const chatWithAITutor = async (params) => {
  const result = await sendMessageToTutor(params);
  return {
    tutorResponse: result.reply,
    hasGrammarMistake: Boolean(result.correctedGrammar),
    correction: result.correctedGrammar
      ? {
          original: params.userMessage || "",
          corrected: result.correctedGrammar,
          explanationVi: result.explanation,
        }
      : null,
  };
};

/**
 * 2. Phân tích ngữ pháp chuyên sâu (Dành cho công cụ kiểm tra câu đơn lẻ)
 */
export const analyzeAndCorrectGrammar = async (
  sentence,
  targetLanguage = "English"
) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      isCorrect: true,
      originalSentence: sentence,
      correctedSentence: sentence,
      explanation: "Vui lòng cấu hình EXPO_PUBLIC_GEMINI_API_KEY để kiểm tra ngữ pháp.",
      betterAlternatives: [],
    };
  }

  const prompt = `
Phân tích ngữ pháp cho câu sau trong ${targetLanguage}: "${sentence}".
Trả về duy nhất JSON:
{
  "isCorrect": true/false,
  "originalSentence": "${sentence}",
  "correctedSentence": "câu đã được sửa đúng",
  "explanation": "giải thích chi tiết bằng tiếng Việt",
  "betterAlternatives": ["cách diễn đạt tự nhiên hơn 1", "cách diễn đạt tự nhiên hơn 2"]
}
`;

  try {
    const response = await fetch(`${GEMINI_API_BASE_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Lỗi analyzeAndCorrectGrammar:", err);
    throw err;
  }
};

/**
 * 3. Sinh bài tập trắc nghiệm thích ứng
 */
export const generateAdaptiveQuiz = async ({
  topic = "Daily Conversation",
  level = "B1",
  numberOfQuestions = 5,
}) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      topic,
      level,
      questions: [
        {
          id: 1,
          question: "She _____ to the gym every morning before work.",
          options: ["go", "goes", "going", "went"],
          correctAnswerIndex: 1,
          explanation: "Chủ ngữ ngôi thứ 3 số ít 'She' ở hiện tại đơn đi với động từ thêm -es (goes).",
        },
      ],
    };
  }

  const prompt = `
Tạo ${numberOfQuestions} câu hỏi trắc nghiệm tiếng Anh cho chủ đề: ${topic}, cấp độ CEFR: ${level}.
Trả về duy nhất JSON:
{
  "topic": "${topic}",
  "level": "${level}",
  "questions": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "Giải thích bằng tiếng Việt"
    }
  ]
}
`;

  try {
    const response = await fetch(`${GEMINI_API_BASE_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Lỗi generateAdaptiveQuiz:", err);
    throw err;
  }
};
