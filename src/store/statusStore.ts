import { create } from 'zustand';
import { StatusMessage, postStatus, listenToStatusMessages } from '../services/status';

interface StatusState {
  messages: StatusMessage[];
  subscribeToStatus: (cliqueId: string) => () => void;
  addStatus: (userId: string, cliqueId: string, lat: number, lng: number, text: string, venueId?: string) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set, get) => ({
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
}));