import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

/**
 * Button component đa năng sử dụng NativeWind (Tailwind CSS)
 * @param {string} title - Tiêu đề nút
 * @param {function} onPress - Sự kiện click
 * @param {'primary' | 'secondary' | 'accent' | 'outline' | 'danger'} variant - Kiểu hiển thị
 * @param {'sm' | 'md' | 'lg'} size - Kích thước nút
 * @param {boolean} loading - Trạng thái đang tải
 * @param {boolean} disabled - Vô hiệu hóa nút
 * @param {React.ReactNode} icon - Icon đi kèm (nếu có)
 * @param {string} className - Các class bổ sung từ bên ngoài
 */
export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
  textClassName = "",
}) => {
  // Biến thể màu sắc nền và border
  const variantStyles = {
    primary: "bg-blue-600 active:bg-blue-700 border-transparent",
    secondary: "bg-emerald-600 active:bg-emerald-700 border-transparent",
    accent: "bg-amber-500 active:bg-amber-600 border-transparent",
    outline: "bg-transparent border border-blue-600 active:bg-blue-50",
    danger: "bg-red-500 active:bg-red-600 border-transparent",
  };

  // Màu chữ tương ứng
  const textVariantStyles = {
    primary: "text-white font-semibold",
    secondary: "text-white font-semibold",
    accent: "text-white font-semibold",
    outline: "text-blue-600 font-semibold",
    danger: "text-white font-semibold",
  };

  // Kích thước nút
  const sizeStyles = {
    sm: "py-2 px-3 rounded-lg",
    md: "py-3.5 px-5 rounded-xl",
    lg: "py-4 px-6 rounded-2xl",
  };

  // Cỡ chữ
  const textSizeStyles = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-lg font-bold",
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center shadow-sm ${variantStyles[variant]} ${sizeStyles[size]} ${
        isDisabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? "#2563eb" : "#ffffff"}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`${textVariantStyles[variant]} ${textSizeStyles[size]} text-center ${textClassName}`}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

