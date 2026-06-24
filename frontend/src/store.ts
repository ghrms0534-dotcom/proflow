import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AppState {
  token: string | null;
  user: User | null;
  currentProjectId: string | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setProjectId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      currentProjectId: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null, currentProjectId: null }),
      setProjectId: (id) => set({ currentProjectId: id }),
    }),
    { name: 'proflow-storage' },
  ),
);
