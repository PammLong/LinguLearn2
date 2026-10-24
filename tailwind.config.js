/** @type {import('tailwindcss').Config} */
module.exports = {
  // Đường dẫn tới toàn bộ các file components và screens để Tailwind quét class
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        secondary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
        },
        accent: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          500: "#ef4444",
        },
        background: "#f8fafc",
        card: "#ffffff",
      },
    },
  },
  plugins: [],
};

