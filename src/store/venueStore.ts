// src/store/venueStore.ts
import { create } from 'zustand';
import { 
  Venue, Rating, 
  addVenue, addRating, 
  deleteVenue, deleteRating, updateRatingComment,
  listenToCliqueVenues, listenToCliqueRatings 
} from '../services/venues';

export type SortOption = 'rating_desc' | 'latest_visit' | 'name_asc';

export interface VenueWithStats extends Venue {
  averageRating: number;
  ratingsCount: number;
  lastVisitDate: Date | null;
}

interface VenueState {
  venues: VenueWithStats[];
  rawVenues: Venue[];
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  sortBy: SortOption;
  filterTags: string[];
  unsubscribeVenues?: () => void;
  unsubscribeRatings?: () => void;

  initLiveListeners: (cliqueId: string) => void;
  cleanup: () => void;
  addVenueManually: (venueData: Omit<Venue, 'id' | 'createdAt'>) => Promise<string>;
  addRatingManually: (ratingData: Omit<Rating, 'id' | 'createdAt'>) => Promise<void>;
  deleteVenueById: (venueId: string) => Promise<void>;
  deleteRatingById: (ratingId: string) => Promise<void>;
  updateRatingCommentById: (ratingId: string, comment: string | undefined) => Promise<void>;
  setSortBy: (sort: SortOption) => void;
  setFilterTags: (tags: string[]) => void;
  getFilteredAndSortedVenues: () => VenueWithStats[];
}

export const useVenueStore = create<VenueState>((set, get) => ({
  venues: [],
  rawVenues: [],
  ratings: [],
  loading: false,
  error: null,
  sortBy: 'rating_desc',
  filterTags: [],

  initLiveListeners: (cliqueId) => {
    get().cleanup();
    const unsubscribeVenues = listenToCliqueVenues(cliqueId, (rawVenues) => {
      const { ratings, sortBy, filterTags } = get();
      set({ rawVenues, venues: applyFiltersAndSort(computeVenueStats(rawVenues, ratings), filterTags, sortBy) });
    });
    const unsubscribeRatings = listenToCliqueRatings(cliqueId, (ratings) => {
      const { rawVenues, sortBy, filterTags } = get();
      set({ ratings, venues: applyFiltersAndSort(computeVenueStats(rawVenues, ratings), filterTags, sortBy) });
    });
    set({ unsubscribeVenues, unsubscribeRatings });
  },

  cleanup: () => {
    get().unsubscribeVenues?.();
    get().unsubscribeRatings?.();
  },

  addVenueManually: async (venueData) => {
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
      set({ loading: false });
      return venueId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addRatingManually: async (ratingData) => {
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
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVenueById: async (venueId) => {
    set({ loading: true, error: null });
    try {
      await deleteVenue(venueId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteRatingById: async (ratingId) => {
    set({ loading: true, error: null });
    try {
      await deleteRating(ratingId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateRatingCommentById: async (ratingId, comment) => {
    set({ loading: true, error: null });
    try {
      await updateRatingComment(ratingId, comment);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setSortBy: (sortBy) => {
    const { venues, filterTags } = get();
    set({ sortBy, venues: applyFiltersAndSort(venues, filterTags, sortBy) });
  },

  setFilterTags: (filterTags) => {
    const { venues, sortBy } = get();
    set({ filterTags, venues: applyFiltersAndSort(venues, filterTags, sortBy) });
  },

  getFilteredAndSortedVenues: () => get().venues,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeVenueStats(venues: Venue[], ratings: Rating[]): VenueWithStats[] {
  const ratingMap = new Map<string, { sum: number; count: number; lastDate: Date | null }>();
  for (const r of ratings) {
    const existing = ratingMap.get(r.venueId) ?? { sum: 0, count: 0, lastDate: null };
    const rDate = r.visitedDate.toDate();
    ratingMap.set(r.venueId, {
      sum: existing.sum + r.rating,
      count: existing.count + 1,
      lastDate: !existing.lastDate || rDate > existing.lastDate ? rDate : existing.lastDate,
    });
  }
  return venues.map(v => {
    const stats = ratingMap.get(v.id!) ?? { sum: 0, count: 0, lastDate: null };
    return {
      ...v,
      averageRating: stats.count === 0 ? 0 : stats.sum / stats.count,
      ratingsCount: stats.count,
      lastVisitDate: stats.lastDate,
    };
  });
}

function applyFiltersAndSort(venues: VenueWithStats[], _filterTags: string[], sortBy: SortOption): VenueWithStats[] {
  const sorted = [...venues];
  switch (sortBy) {
    case 'rating_desc':
      return sorted.sort((a, b) => b.averageRating - a.averageRating);
    case 'latest_visit':
      return sorted.sort((a, b) => (b.lastVisitDate?.getTime() ?? 0) - (a.lastVisitDate?.getTime() ?? 0));
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}