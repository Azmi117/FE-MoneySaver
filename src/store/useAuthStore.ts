// src/store/useAuthStore.ts
import { create } from 'zustand';

export interface UserProfile {
  id?: number;
  ID?: number;
  name?: string;
  email?: string;
}

interface AuthState {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null }),
}));