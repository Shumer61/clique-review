// src/store/authStore.ts
import { create } from 'zustand';
import { User } from 'firebase/auth';
import { logIn, signUp, logOut, onAuthStateChange } from '../services/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await signUp(email, password);
      set({ user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await logIn(email, password);
      set({ user, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logOut: async () => {
    set({ loading: true });
    await logOut();
    set({ user: null, loading: false });
  },

  initAuthListener: () => {
    const unsubscribe = onAuthStateChange((user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },
}));