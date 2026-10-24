import React from "react";
import { View } from "react-native";

/**
 * Card container chuẩn cho giao diện Mobile-first sử dụng NativeWind
 */
export const Card = ({ children, className = "" }) => {
  return (
    <View
      className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 ${className}`}
    >
      {children}
    </View>
  );
};

