import { database } from "./firebaseConfig";
import { ref, push, set, onValue, off } from "firebase/database";

/**
 * 1. Lưu tin nhắn mới vào Firebase Realtime Database
 * Nhánh lưu trữ: chats/${uid}/${sessionId}/messages
 * 
 * @param {string} uid - ID người dùng (Firebase Auth UID)
 * @param {string} sessionId - ID phiên trò chuyện (ví dụ: 'session_default' hoặc id theo ngày/chủ đề)
 * @param {object} messageData - Dữ liệu tin nhắn
 * @param {'user' | 'model'} messageData.role - Người gửi (user hoặc model/AI)
 * @param {string} messageData.text - Nội dung tin nhắn
 * @param {string} [messageData.correctedGrammar] - Câu đã được AI sửa (nếu có)
 * @param {string} [messageData.explanation] - Giải thích lỗi từ AI (nếu có)
 * @param {number} [messageData.timestamp] - Thời gian gửi (mili-giây)
 * @returns {Promise<object>} Dữ liệu tin nhắn đã được lưu kèm id sinh tự động
 */
export const saveMessage = async (uid, sessionId, messageData) => {
  try {
    if (!uid || !sessionId) {
      throw new Error("Thiếu tham số 'uid' hoặc 'sessionId' khi lưu tin nhắn.");
    }

    const messagesRef = ref(database, `chats/${uid}/${sessionId}/messages`);
    const newMessageRef = push(messagesRef);

    const payload = {
      role: messageData.role || "user",
      text: messageData.text || "",
      correctedGrammar: messageData.correctedGrammar || "",
      explanation: messageData.explanation || "",
      timestamp: messageData.timestamp || Date.now(),
    };

    await set(newMessageRef, payload);

    return {
      id: newMessageRef.key,
      ...payload,
    };
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn vào Firebase (saveMessage):", error);
    throw error;
  }
};

/**
 * 2. Lắng nghe danh sách tin nhắn theo thời gian thực (Realtime Listener)
 * Sử dụng onValue để tự động nhận dữ liệu mới khi có tin nhắn phát sinh
 * 
 * @param {string} uid - ID người dùng
 * @param {string} sessionId - ID phiên trò chuyện
 * @param {function(Array): void} callback - Hàm callback nhận mảng danh sách tin nhắn
 * @returns {function(): void} Hàm hủy lắng nghe (unsubscribe) dùng cho cleanup trong useEffect
 */
export const subscribeToMessages = (uid, sessionId, callback) => {
  if (!uid || !sessionId) {
    console.warn("Thiếu 'uid' hoặc 'sessionId' để lắng nghe tin nhắn.");
    return () => {};
  }

  const messagesRef = ref(database, `chats/${uid}/${sessionId}/messages`);

  const unsubscribe = onValue(
    messagesRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const rawData = snapshot.val();
      
      // Chuyển đổi dữ liệu từ dạng Object { [id]: data } sang mảng danh sách [ { id, ...data } ]
      const messageList = Object.keys(rawData).map((key) => ({
        id: key,
        ...rawData[key],
      }));

      // Sắp xếp danh sách tin nhắn theo thứ tự thời gian tăng dần (cũ -> mới)
      messageList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      callback(messageList);
    },
    (error) => {
      console.error("Lỗi lắng nghe tin nhắn Realtime (subscribeToMessages):", error);
    }
  );

  // Trả về hàm cleanup để hủy listener khi unmount component
  return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    } else {
      off(messagesRef);
    }
  };
};

