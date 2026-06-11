// src/store/statusStore.ts
import { create } from 'zustand';
import { postStatus, deleteStatus, listenToStatusMessages } from '../services/status';
export const useStatusStore = create((set) => ({
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
