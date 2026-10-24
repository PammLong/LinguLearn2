# 🌍 LinguLearn - AI-Powered Language Learning App

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Google%20Gemini-API-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Firebase-Realtime%20%26%20Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/NativeWind-v4%20(Tailwind)-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="NativeWind" />
  <img src="https://img.shields.io/badge/State-Zustand-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License MIT" />
</p>

<p align="center">
  <strong>LinguLearn</strong> là ứng dụng di động hỗ trợ học ngoại ngữ cá nhân hóa thế hệ mới. Bằng việc kết hợp sức mạnh của <strong>Mô hình ngôn ngữ lớn (Google Gemini)</strong> và nền tảng <strong>Firebase Real-time</strong>, LinguLearn mang đến môi trường luyện tập phản xạ giao tiếp tự nhiên 24/7, tự động sửa lỗi ngữ pháp và tạo bài kiểm tra đánh giá thích ứng theo từng cấp độ người học.
</p>

---

## 📱 Giao diện & Trải nghiệm người dùng (Demo)

| Màn hình chính (Home) | Gia sư AI (LinguTutor) | Trắc nghiệm thích ứng (Quiz) | Hồ sơ & Trình độ (Profile) |
| :---: | :---: | :---: | :---: |
| ![Home Screen](https://via.placeholder.com/260x520/f8fafc/1e293b?text=Chèn+ảnh+HomeScreen) | ![Tutor Screen](https://via.placeholder.com/260x520/f8fafc/1e293b?text=Chèn+ảnh+TutorScreen) | ![Quiz Screen](https://via.placeholder.com/260x520/f8fafc/1e293b?text=Chèn+ảnh+QuizScreen) | ![Profile Screen](https://via.placeholder.com/260x520/f8fafc/1e293b?text=Chèn+ảnh+ProfileScreen) |

> 💡 *Các ảnh demo thực tế trên thiết bị sẽ được cập nhật tại các vị trí placeholder trên.*

---

## ✨ Tính năng nổi bật (Key Features)

- 🤖 **Gia sư ảo AI thông minh (LinguTutor):** Trò chuyện tương tác đa ngữ cảnh (phỏng vấn, du lịch, đời sống thường nhật). Gia sư phản hồi tự nhiên, khuyến khích học viên mở rộng câu chuyện.
- 💡 **Phân tích & Sửa lỗi ngữ pháp tức thì:** Mỗi khi học viên mắc lỗi ngữ pháp hay dùng từ chưa chuẩn bản xứ, AI sẽ ngay lập tức gắn thẻ góp ý, giải thích chi tiết quy tắc bằng tiếng Việt và cung cấp mẫu câu chuẩn xác.
- 📝 **Sinh bài tập trắc nghiệm theo năng lực (Adaptive Quiz):** Tự động sinh đề kiểm tra 4 lựa chọn (A, B, C, D) theo chuẩn khung tham chiếu CEFR (A1, A2, B1, B2, C1) với phần giải thích chi tiết đáp án.
- ⚡ **Đồng bộ thời gian thực với Firebase:** Lưu trữ toàn bộ lịch sử tin nhắn trò chuyện, tiến độ làm bài tập và điểm số lên Firebase Real-time Database.
- 🎨 **Giao diện hiện đại & Mobile-first:** Tận dụng hệ thống Utility Classes từ NativeWind (Tailwind CSS) giúp ứng dụng có giao diện mượt mà, đồng bộ và tối ưu thao tác trên thiết bị di động.
- 🐻 **Quản lý trạng thái nhẹ & hiệu quả với Zustand:** Giảm tải re-render không cần thiết, quản lý phiên đăng nhập và luồng dữ liệu mượt mà.

---

## 🛠️ Công nghệ và Thư viện sử dụng (Tech Stack)

| Phân hệ | Công nghệ / Thư viện | Vai trò |
| :--- | :--- | :--- |
| **Mobile Core** | React Native, Expo (SDK 52) | Nền tảng phát triển ứng dụng di động đa nền tảng (iOS & Android) |
| **Styling** | NativeWind v4, Tailwind CSS | Xây dựng giao diện UI tiện lợi qua utility classes |
| **Navigation** | React Navigation (Native Stack, Bottom Tabs) | Quản lý luồng chuyển trang và thanh điều hướng chính |
| **State Management**| Zustand | Quản lý trạng thái toàn cục (Auth, Chat Session, Quiz Engine) |
| **Artificial Intelligence** | Google Gemini API (`@google/generative-ai`) | Đóng vai trò gia sư AI, sửa lỗi ngữ pháp và sinh đề trắc nghiệm |
| **Backend & Cloud** | Firebase Authentication, Real-time Database | Xác thực người dùng, lưu trữ dữ liệu hội thoại và kết quả học tập |
| **Local Storage** | AsyncStorage | Lưu trữ phiên đăng nhập và thiết lập ngoại tuyến trên máy khách |

---

## 🚀 Hướng dẫn cài đặt và Khởi chạy (Getting Started)

### 1. Yêu cầu môi trường (Prerequisites)
- [Node.js](https://nodejs.org/) phiên bản LTS (khuyến nghị **Node 18** trở lên).
- Trình quản lý gói `npm` hoặc `yarn`.
- Điện thoại thật đã cài đặt ứng dụng **Expo Go** (tải trên [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) hoặc [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)) hoặc máy ảo Android Emulator / iOS Simulator.

---

### 2. Tải mã nguồn về máy (Clone Repository)
```bash
git clone https://github.com/PammLong/LinguLearn2
cd LinguLearn2
```

---

### 3. Cài đặt các gói phụ thuộc (Dependencies)
Chạy lệnh cài đặt toàn bộ thư viện cần thiết:
```bash
npm install
```

---

### 4. Thiết lập biến môi trường (Environment Variables)
Tạo tệp `.env` tại thư mục gốc của dự án (hoặc sao chép từ file mẫu [.env.example](file:///c:/University/nam4/DACN2/LinguLearn2/.env.example)):

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Mở file `.env` và điền các khóa cấu hình thực tế của bạn:

```env
# -------------------------------------------------------------
# Cấu hình Firebase (Lấy từ Firebase Console > Project Settings)
# -------------------------------------------------------------
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-app-id-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

# -------------------------------------------------------------
# Cấu hình Google Gemini AI (Lấy từ Google AI Studio)
# -------------------------------------------------------------
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY
```

> ⚠️ **Lưu ý bảo mật:** File `.env` chứa các khóa bí mật và đã được khai báo trong `.gitignore`. Không đẩy file `.env` chứa key thật lên các kho lưu trữ công khai!

---

### 5. Khởi chạy ứng dụng
Chạy lệnh sau để khởi động máy chủ phát triển Metro Bundler:

```bash
npx expo start -c
```

**Cách xem ứng dụng:**
- **Trên thiết bị thật:** Mở ứng dụng **Expo Go**, dùng camera quét mã QR hiển thị trên màn hình terminal.
- **Trên Android Emulator:** Nhấn phím `a` trên bàn phím terminal.
- **Trên iOS Simulator:** Nhấn phím `i` trên bàn phím terminal (yêu cầu máy macOS có Xcode).

---

## 📂 Cấu trúc thư mục dự án (Project Structure)

```text
LinguLearn2/
├── assets/                     # Tài nguyên hình ảnh, biểu tượng ứng dụng
├── src/
│   ├── components/             # Các khối giao diện tái sử dụng
│   │   ├── common/             # Button, Card, Modal, Input...
│   │   │   ├── Button.js       # Nút bấm tích hợp NativeWind
│   │   │   └── Card.js         # Container bo góc, đổ bóng
│   │   └── home/
│   │       └── CourseCard.js   # Thẻ hiển thị chủ đề học & tiến độ
│   ├── constants/              # Dữ liệu tĩnh, bảng cấp độ CEFR, chủ đề
│   │   └── index.js
│   ├── navigation/             # Hệ thống điều hướng
│   │   ├── RootNavigator.js    # Stack điều hướng chính (Auth vs Main)
│   │   └── BottomTabNavigator.js # Thanh TabBar 4 màn hình
│   ├── screens/                # Màn hình chức năng
│   │   ├── auth/LoginScreen.js       # Đăng nhập & Đăng ký Firebase
│   │   ├── home/HomeScreen.js        # Trang chủ & Lộ trình hôm nay
│   │   ├── tutor/TutorScreen.js      # Giao tiếp gia sư AI & Sửa ngữ pháp
│   │   ├── quiz/QuizScreen.js        # Làm bài tập trắc nghiệm thích ứng
│   │   └── profile/ProfileScreen.js  # Cá nhân hóa & Lựa chọn cấp độ
│   ├── services/               # Tích hợp API và dịch vụ bên thứ ba
│   │   ├── firebaseConfig.js   # Khởi tạo Auth & Realtime Database
│   │   └── llmService.js       # Kết nối Google Gemini API
│   ├── store/                  # Quản lý Global State với Zustand
│   │   ├── useAuthStore.js     # Trạng thái đăng nhập & thông tin người dùng
│   │   ├── useTutorStore.js    # Lịch sử hội thoại & trạng thái phản hồi AI
│   │   └── useQuizStore.js     # Tiến trình làm bài tập & tính điểm
│   └── utils/                  # Các hàm tiện ích dùng chung
├── .env.example                # File mẫu định nghĩa biến môi trường
├── App.js                      # Điểm khởi chạy của ứng dụng (Root Component)
├── app.json                    # Cấu hình ứng dụng Expo
├── babel.config.js             # Cấu hình Babel & NativeWind preset
├── global.css                  # Directives Tailwind CSS
├── metro.config.js             # Cấu hình Metro bundler với NativeWind v4
├── package.json                # Quản lý phiên bản thư viện
└── tailwind.config.js          # Khai báo theme, màu sắc và đường dẫn quét class
```

---

## 👥 Nhóm phát triển (Development Team)

Dự án được lên ý tưởng, thiết kế kiến trúc và phát triển bởi:

- **Trương Huỳnh Đạt** - *Frontend & AI Integration*
- **Phạm Ngọc Long** - *Fullstack Mobile & Database Architecture*

---

## 📄 Giấy phép (License)

Dự án được phát hành theo giấy phép **[MIT License](LICENSE)**. Bạn hoàn toàn có thể tự do sử dụng, chỉnh sửa và phân phối lại cho mục đích nghiên cứu và giáo dục.

