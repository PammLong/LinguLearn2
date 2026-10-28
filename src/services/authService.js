import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "./firebaseConfig";

/**
 * Chuyển đổi mã lỗi Firebase Auth và Real-time Database thành thông báo tiếng Việt
 * @param {string} errorCode - Mã lỗi từ Firebase
 * @param {string} fallbackMsg - Thông báo dự phòng
 * @returns {string} Thông báo lỗi dễ hiểu
 */
const getAuthErrorMessage = (errorCode, fallbackMsg = "") => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.";
    case "auth/invalid-email":
      return "Định dạng email không hợp lệ. Vui lòng kiểm tra lại.";
    case "auth/operation-not-allowed":
      return "Phương thức đăng nhập Email/Mật khẩu chưa được kích hoạt trong Firebase Console (Authentication > Sign-in method).";
    case "auth/weak-password":
      return "Mật khẩu quá yếu. Vui lòng nhập tối thiểu 6 ký tự.";
    case "auth/user-disabled":
      return "Tài khoản này đã bị tạm khóa. Vui lòng liên hệ quản trị viên.";
    case "auth/user-not-found":
      return "Không tìm thấy tài khoản với email này.";
    case "auth/wrong-password":
      return "Mật khẩu không chính xác.";
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không chính xác.";
    case "auth/too-many-requests":
      return "Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.";
    case "auth/network-request-failed":
      return "Lỗi mạng. Vui lòng kiểm tra kết nối internet của bạn.";
    case "PERMISSION_DENIED":
      return "Lỗi Real-time Database: Quyền truy cập bị từ chối (PERMISSION_DENIED). Vui lòng cập nhật Rules trong Firebase Console.";
    default:
      return fallbackMsg || "Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại!";
  }
};

/**
 * Đăng ký tài khoản người dùng mới và lưu profile vào Real-time Database
 * @param {string} email - Địa chỉ email
 * @param {string} password - Mật khẩu đăng nhập
 * @param {string} displayName - Tên hiển thị của người học
 * @returns {Promise<object>}
 */
export const registerUser = async (email, password, displayName = "") => {
  try {
    // 1. Tạo tài khoản trong Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    const user = userCredential.user;

    // 2. Tạo đối tượng thông tin người dùng
    const userProfile = {
      uid: user.uid,
      displayName: displayName.trim() || "Học viên LinguLearn",
      email: user.email,
      targetLanguage: "English",
      currentLevel: "A1",
      createdAt: new Date().toISOString(),
    };

    // 3. Lưu thông tin vào nhánh users/${uid} trên Firebase Real-time Database
    try {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, userProfile);
    } catch (dbError) {
      console.warn("Lưu profile vào Real-time DB thất bại:", dbError);
      // Nếu lỗi permission denied ở DB, vẫn báo rõ cho developer biết
      if (dbError.code === "PERMISSION_DENIED" || dbError.message?.includes("PERMISSION_DENIED")) {
        throw new Error("Tài khoản Auth đã tạo, nhưng Real-time Database bị chặn ghi (PERMISSION_DENIED). Vui lòng mở Rules trong Firebase Console.");
      }
    }

    // Trả về cả dạng phẳng và nested để tương thích mọi cách gọi
    return {
      success: true,
      ...userProfile,
      user: userProfile,
    };
  } catch (error) {
    console.error("Lỗi registerUser:", error);
    const friendlyMessage = getAuthErrorMessage(error.code, error.message);
    throw new Error(friendlyMessage);
  }
};

/**
 * Đăng nhập người dùng bằng Email và Mật khẩu
 * @param {string} email - Địa chỉ email
 * @param {string} password - Mật khẩu đăng nhập
 * @returns {Promise<object>}
 */
export const loginUser = async (email, password) => {
  try {
    // 1. Thực hiện đăng nhập qua Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    const user = userCredential.user;

    // 2. Đồng bộ thêm thông tin profile từ Real-time Database
    let profileData = null;
    try {
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        profileData = snapshot.val();
      }
    } catch (readError) {
      console.warn("Không thể lấy profile người dùng từ Realtime DB:", readError);
    }

    const resultUser = {
      uid: user.uid,
      email: user.email,
      displayName: profileData?.displayName || user.displayName || "Học viên LinguLearn",
      targetLanguage: profileData?.targetLanguage || "English",
      currentLevel: profileData?.currentLevel || "A1",
    };

    // Trả về cả dạng phẳng (user.email) và nested (user.user.email)
    return {
      success: true,
      ...resultUser,
      user: resultUser,
    };
  } catch (error) {
    console.error("Lỗi loginUser:", error);
    const friendlyMessage = getAuthErrorMessage(error.code, error.message);
    throw new Error(friendlyMessage);
  }
};

/**
 * Đăng xuất tài khoản người dùng hiện tại
 * @returns {Promise<boolean>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Lỗi logoutUser:", error);
    throw new Error("Đăng xuất thất bại. Vui lòng thử lại!");
  }
};
