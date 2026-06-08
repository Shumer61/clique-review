import { create } from 'zustand';
import { Venue, Rating, addVenue, getCliqueVenues, addRating, getCliqueRatings } from '../services/venues';
import { useCliqueStore } from './cliqueStore';

interface VenueWithRatings extends Venue {
  averageRating?: number;
  ratingsCount?: number;
}

interface VenueState {
  venues: VenueWithRatings[];
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  loadVenues: (cliqueId: string) => Promise<void>;
  loadRatings: (cliqueId: string) => Promise<void>;
  createVenue: (venueData: Omit<Venue, 'id' | 'createdAt'>) => Promise<string>;
  createRating: (ratingData: Omit<Rating, 'id' | 'createdAt'>) => Promise<void>;
  getAverageRatingForVenue: (venueId: string) => number;
}

export const useVenueStore = create<VenueState>((set, get) => ({
  venues: [],
  ratings: [],
  loading: false,
  error: null,

  loadVenues: async (cliqueId) => {
  console.log('[venueStore] loadVenues called with cliqueId:', cliqueId);
  set({ loading: true, error: null });
  try {
    const venues = await getCliqueVenues(cliqueId);
    console.log('[venueStore] getCliqueVenues returned:', venues);
    set({ venues, loading: false });
  } catch (error: any) {
    console.error('[venueStore] loadVenues error:', error);
    set({ error: error.message, loading: false });
  }
},

  loadRatings: async (cliqueId) => {
    console.log('[venueStore] loadRatings called with cliqueId:', cliqueId);
    set({ loading: true });
    try {
      const ratings = await getCliqueRatings(cliqueId);
      console.log('[venueStore] getCliqueRatings returned:', ratings);
      set({ ratings, loading: false });
    } catch (error: any) {
      console.error('[venueStore] loadRatings error:', error);
      set({ error: error.message, loading: false });
    }
  },

  createVenue: async (venueData) => {
    set({ loading: true, error: null });
    try {
      const venueId = await addVenue(
        venueData.name,
        venueData.address,
        venueData.location.latitude,
        venueData.location.longitude,
        venueData.addedBy,
        venueData.addedByCliqueId
      );
      // Reload venues for the current clique
      const { currentClique } = useCliqueStore.getState();
      if (currentClique?.id) {
        await get().loadVenues(currentClique.id);
      }
      set({ loading: false });
      return venueId;
    } catch (error: any) {
      console.error('createVenue error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createRating: async (ratingData) => {
    set({ loading: true, error: null });
    try {
      await addRating(
        ratingData.venueId,
        ratingData.cliqueId,
        ratingData.userId,
        ratingData.rating,
        ratingData.tags,
        ratingData.comment,
        ratingData.visitedDate.toDate()
      );
      await get().loadRatings(ratingData.cliqueId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getAverageRatingForVenue: (venueId) => {
    const ratings = get().ratings.filter(r => r.venueId === venueId);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  },
}));