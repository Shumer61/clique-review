import { create } from 'zustand';
import { Clique, createClique, joinClique, getUserCliques, getCliqueByInviteCode } from '../services/firestore';

interface CliqueState {
  cliques: Clique[];
  currentClique: Clique | null;
  loading: boolean;
  error: string | null;
  lastCreatedInviteCode: string | null; // Store invite code after creation
  loadUserCliques: (userId: string) => Promise<void>;
  createNewClique: (name: string, ownerId: string) => Promise<{ cliqueId: string; inviteCode: string }>;
  joinCliqueWithCode: (inviteCode: string, userId: string) => Promise<void>;
  setCurrentClique: (clique: Clique | null) => void;
  clearLastInviteCode: () => void;
}

export const useCliqueStore = create<CliqueState>((set, get) => ({
  cliques: [],
  currentClique: null,
  loading: false,
  error: null,
  lastCreatedInviteCode: null,

  loadUserCliques: async (userId) => {
    set({ loading: true, error: null });
    try {
      const cliques = await getUserCliques(userId);
      set({ cliques, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createNewClique: async (name, ownerId) => {
    set({ loading: true, error: null });
    try {
      const { id: cliqueId, inviteCode } = await createClique(name, ownerId);
      await get().loadUserCliques(ownerId);
      set({ lastCreatedInviteCode: inviteCode, loading: false });
      return { cliqueId, inviteCode };
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  joinCliqueWithCode: async (inviteCode, userId) => {
    set({ loading: true, error: null });
    try {
      const clique = await getCliqueByInviteCode(inviteCode);
      if (!clique) throw new Error('Invalid invite code');
      if (!clique.id) throw new Error('Clique ID missing');
      await joinClique(clique.id, userId);
      await get().loadUserCliques(userId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setCurrentClique: (clique) => set({ currentClique: clique }),

  clearLastInviteCode: () => set({ lastCreatedInviteCode: null }),
}));