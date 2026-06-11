// src/store/statusStore.ts
import { create } from 'zustand';
import { StatusMessage, postStatus, deleteStatus, listenToStatusMessages } from '../services/status';

interface StatusState {
  messages: StatusMessage[];
  subscribeToStatus: (cliqueId: string) => () => void;
  addStatus: (userId: string, cliqueId: string, lat: number, lng: number, text: string, venueId?: string) => Promise<void>;
  removeStatus: (statusId: string) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set) => ({
  messages: [],

  subscribeToStatus: (cliqueId) => {
    const unsubscribe = listenToStatusMessages(cliqueId, (messages) => {
      set({ messages });
    });
    return unsubscribe;
  },

  addStatus: async (userId, cliqueId, lat, lng, text, venueId) => {
    await postStatus(userId, cliqueId, lat, lng, text, venueId);
  },

  removeStatus: async (statusId) => {
    await deleteStatus(statusId);
  },
}));