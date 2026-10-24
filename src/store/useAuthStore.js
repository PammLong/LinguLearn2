import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  targetLanguage: "Tiếng Anh",
  currentLevel: "B1",

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
  setCurrentLevel: (currentLevel) => set({ currentLevel }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

