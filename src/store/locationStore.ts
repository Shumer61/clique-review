import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { useCliqueStore } from './cliqueStore';
import { setUserLocation, deleteUserLocation } from '../services/location';
import { getUserAvatarColor } from '../utils/avatarColor';

const NAIROBI = { lat: -1.2921, lng: 36.8219 };
const MAX_DISTANCE_KM = 500;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface LocationState {
  isSharing: boolean;
  watchId: number | null;
  currentLocation: { lat: number; lng: number } | null;
  startSharing: () => void;
  stopSharing: () => Promise<void>;
  setManualLocation: (lat: number, lng: number) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  isSharing: false,
  watchId: null,
  currentLocation: null,

  startSharing: () => {
    const { user } = useAuthStore.getState();
    const { currentClique } = useCliqueStore.getState();
    if (!user || !currentClique) {
      alert('No user or clique');
      return;
    }
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    // Clear any existing watcher
    const { watchId: oldId } = get();
    if (oldId !== null) navigator.geolocation.clearWatch(oldId);

    const color = getUserAvatarColor(user.uid);
    let fallbackUsed = false;

    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const dist = distanceKm(latitude, longitude, NAIROBI.lat, NAIROBI.lng);
      console.log(`[GPS] lat: ${latitude}, lng: ${longitude}, distance to Nairobi: ${dist.toFixed(0)} km`);

      // If fallback already used, ignore all future GPS updates
      if (fallbackUsed) {
        console.log('[GPS] Fallback already used, ignoring update');
        return;
      }

      if (dist > MAX_DISTANCE_KM) {
        fallbackUsed = true;
        console.warn(`Location too far (${dist} km) – falling back to Nairobi and stopping GPS`);
        alert(`Auto‑location is inaccurate (${dist} km from Kenya). Using Nairobi as default. You can click on the map to set your exact location.`);
        set({ currentLocation: NAIROBI });
        setUserLocation(user.uid, currentClique.id!, NAIROBI.lat, NAIROBI.lng, color).then(() => {
          console.log('[Fallback] Wrote Nairobi location to Firestore');
        });
        // Stop further GPS updates
        const { watchId } = get();
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          set({ watchId: null });
        }
        return;
      }

      // Good location
      console.log('[GPS] Good location, writing to Firestore');
      set({ currentLocation: { lat: latitude, lng: longitude } });
      setUserLocation(user.uid, currentClique.id!, latitude, longitude, color);
    };

    const error = (err: GeolocationPositionError) => {
      console.error('Geolocation error:', err);
      alert('Could not get your location. Using Nairobi as default. You can click on the map to adjust.');
      set({ currentLocation: NAIROBI });
      setUserLocation(user.uid, currentClique.id!, NAIROBI.lat, NAIROBI.lng, color).then(() => {
        console.log('[Fallback due to error] Wrote Nairobi to Firestore');
      });
      const { watchId } = get();
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        set({ watchId: null });
      }
    };

    const watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 30000,
    });

    set({ isSharing: true, watchId });
  },

  stopSharing: async () => {
    const { watchId } = get();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    const { user } = useAuthStore.getState();
    if (user) {
      await deleteUserLocation(user.uid);
      console.log('[stopSharing] Deleted location for user', user.uid);
    }
    set({ isSharing: false, watchId: null, currentLocation: null });
  },

  setManualLocation: async (lat: number, lng: number) => {
    const { user } = useAuthStore.getState();
    const { currentClique } = useCliqueStore.getState();
    if (!user || !currentClique) return;
    const color = getUserAvatarColor(user.uid);
    await setUserLocation(user.uid, currentClique.id!, lat, lng, color);
    set({ currentLocation: { lat, lng } });
    if (!get().isSharing) {
      set({ isSharing: true });
    }
    // Stop any running watcher
    const { watchId } = get();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      set({ watchId: null });
    }
    console.log(`[Manual] Location set to ${lat}, ${lng}`);
  },
}));