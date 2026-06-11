// src/store/locationStore.ts
import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { useCliqueStore } from './cliqueStore';
import { setUserLocation, deleteUserLocation } from '../services/location';
import { getUserAvatarColor } from '../utils/avatarColor';
// Write location to Firestore — shared by both geolocation watch and manual set
async function persistLocation(lat, lng) {
    const { user } = useAuthStore.getState();
    const { currentClique } = useCliqueStore.getState();
    if (!user || !currentClique?.id)
        return;
    const color = getUserAvatarColor(user.uid);
    await setUserLocation(user.uid, currentClique.id, lat, lng, color);
}
export const useLocationStore = create((set, get) => ({
    isSharing: false,
    currentLocation: null,
    _watchId: null,
    startSharing: () => {
        // Guard: don't double-start
        if (get().isSharing)
            return;
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        // Immediately get current position and write it
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            await persistLocation(lat, lng);
            set({ currentLocation: { lat, lng } });
        }, (err) => console.warn('Initial position error:', err), { enableHighAccuracy: true, timeout: 10000 });
        // Then watch for movement
        const watchId = navigator.geolocation.watchPosition(async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            await persistLocation(lat, lng);
            set({ currentLocation: { lat, lng } });
        }, (err) => console.warn('Watch position error:', err), { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 });
        set({ isSharing: true, _watchId: watchId });
    },
    stopSharing: async () => {
        const { _watchId } = get();
        if (_watchId !== null) {
            navigator.geolocation.clearWatch(_watchId);
        }
        const { user } = useAuthStore.getState();
        if (user)
            await deleteUserLocation(user.uid);
        set({ isSharing: false, currentLocation: null, _watchId: null });
    },
    // Manual override — user clicks map to set location (still useful indoors / GPS-denied)
    setManualLocation: async (lat, lng) => {
        await persistLocation(lat, lng);
        set({ currentLocation: { lat, lng } });
        // Auto-enable sharing flag if not already on
        if (!get().isSharing)
            set({ isSharing: true });
    },
}));
