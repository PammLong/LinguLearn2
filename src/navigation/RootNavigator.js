import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomTabNavigator } from "./BottomTabNavigator";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { useAuthStore } from "../store/useAuthStore";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
