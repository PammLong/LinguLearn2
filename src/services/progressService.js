import { database } from "./firebaseConfig";
import {
  ref,
  get,
  set,
  update,
  onValue,
  runTransaction,
  off,
} from "firebase/database";

/**
 * Tính toán chuỗi ngày học liên tiếp (streakDays) dựa trên lastActive
 * @param {number|null} lastActive - Timestamp lần học trước (mili-giây)
 * @param {number} currentStreak - Số ngày streak hiện tại
 * @returns {number} Chuỗi ngày streak mới
 */
export const calculateStreak = (lastActive, currentStreak = 0) => {
  if (!lastActive) {
    return 1;
  }

  const nowDate = new Date();
  const lastDate = new Date(lastActive);

  // Chuẩn hóa về mốc đầu ngày (00:00:00) theo lịch địa phương để so sánh chính xác số ngày
  const nowDay = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate()
  );
  const lastDay = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth(),
    lastDate.getDate()
  );

  const diffTime = nowDay.getTime() - lastDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Đã học trong ngày hôm nay: giữ nguyên streak (tối thiểu là 1)
    return currentStreak > 0 ? currentStreak : 1;
  } else if (diffDays === 1) {
    // Học nối tiếp từ ngày hôm qua: tăng thêm 1 ngày vào chuỗi
    return (currentStreak || 0) + 1;
  } else {
    // Bỏ lỡ từ 2 ngày trở lên: đứt chuỗi, bắt đầu lại từ ngày 1
    return 1;
  }
};

/**
 * 1. Cập nhật tiến độ người dùng an toàn bằng runTransaction
 * Nhánh lưu trữ: userProgress/${uid}
 * 
 * @param {string} uid - ID người dùng
 * @param {number} addedScore - Điểm số cộng dồn thêm (+10 điểm / câu trắc nghiệm đúng, +5 điểm / lượt chat)
 * @returns {Promise<object>} Dữ liệu tiến độ sau khi cập nhật
 */
export const updateUserProgress = async (uid, addedScore = 0) => {
  try {
    if (!uid || uid === "guest_user") return null;

    const progressRef = ref(database, `userProgress/${uid}`);

    const result = await runTransaction(progressRef, (currentData) => {
      const data = currentData || {};
      const newStreak = calculateStreak(data.lastActive, data.streakDays || 0);
      const newScore = (data.totalScore || 0) + (Number(addedScore) || 0);

      return {
        ...data,
        totalScore: Math.max(0, newScore),
        streakDays: newStreak,
        lastActive: Date.now(),
      };
    });

    return result.snapshot.val();
  } catch (error) {
    console.error("Lỗi khi cập nhật userProgress (runTransaction):", error);
    throw error;
  }
};

/**
 * 2. Lắng nghe tiến độ người dùng theo thời gian thực (Realtime Listener)
 * 
 * @param {string} uid - ID người dùng
 * @param {function(object): void} callback - Nhận dữ liệu { totalScore, streakDays, lastActive }
 * @returns {function(): void} Hàm hủy lắng nghe (unsubscribe)
 */
export const subscribeToUserProgress = (uid, callback) => {
  if (!uid || uid === "guest_user") {
    callback({ totalScore: 0, streakDays: 0, lastActive: null });
    return () => {};
  }

  const progressRef = ref(database, `userProgress/${uid}`);

  const unsubscribe = onValue(
    progressRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({ totalScore: 0, streakDays: 0, lastActive: null });
        return;
      }

      const val = snapshot.val() || {};
      callback({
        totalScore: val.totalScore || 0,
        streakDays: val.streakDays || 0,
        lastActive: val.lastActive || null,
        quizzesCompleted: val.quizzesCompleted || 0,
      });
    },
    (error) => {
      console.error("Lỗi khi lắng nghe userProgress:", error);
    }
  );

  return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    } else {
      off(progressRef);
    }
  };
};

/**
 * 3. Lắng nghe danh sách tối đa 5 bài trắc nghiệm gần nhất
 * 
 * @param {string} uid - ID người dùng
 * @param {function(Array): void} callback - Nhận mảng 5 bài tập gần nhất được sắp xếp mới ➔ cũ
 * @returns {function(): void} Hàm hủy lắng nghe (unsubscribe)
 */
export const subscribeToRecentExercises = (uid, callback) => {
  if (!uid || uid === "guest_user") {
    callback([]);
    return () => {};
  }

  const exercisesRef = ref(database, `exercises/${uid}`);

  const unsubscribe = onValue(
    exercisesRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const rawData = snapshot.val() || {};
      const list = Object.keys(rawData).map((key) => ({
        id: key,
        ...rawData[key],
      }));

      // Sắp xếp giảm dần theo timestamp (bài mới nhất đứng đầu)
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Lấy tối đa 5 bài làm gần nhất
      const top5Recent = list.slice(0, 5);

      callback(top5Recent);
    },
    (error) => {
      console.error("Lỗi khi lắng nghe exercises gần nhất:", error);
    }
  );

  return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    } else {
      off(exercisesRef);
    }
  };
};

