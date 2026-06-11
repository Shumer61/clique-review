// src/store/authStore.ts
import { create } from 'zustand';
import { logIn, signUp, logOut, onAuthStateChange } from '../services/firebase';
export const useAuthStore = create((set, get) => ({
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
        }
        catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },
    logIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const user = await logIn(email, password);
            set({ user, loading: false });
        }
        catch (error) {
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
