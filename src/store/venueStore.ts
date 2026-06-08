import { create } from 'zustand';
import { Venue, Rating, addVenue, addRating, listenToCliqueVenues, listenToCliqueRatings } from '../services/venues';

export type SortOption = 'rating_desc' | 'latest_visit' | 'name_asc';

interface VenueWithStats extends Venue {
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
  
  // Actions
  initLiveListeners: (cliqueId: string) => void;
  cleanup: () => void;
  addVenueManually: (venueData: Omit<Venue, 'id' | 'createdAt'>) => Promise<string>;
  addRatingManually: (ratingData: Omit<Rating, 'id' | 'createdAt'>) => Promise<void>;
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
    // Clean up previous listeners
    get().cleanup();
    
    // Listen to venues
    const unsubscribeVenues = listenToCliqueVenues(cliqueId, (rawVenues) => {
      set({ rawVenues });
      const { ratings, sortBy, filterTags } = get();
      const computed = computeVenueStats(rawVenues, ratings);
      set({ venues: applyFiltersAndSort(computed, filterTags, sortBy) });
    });
    
    // Listen to ratings
    const unsubscribeRatings = listenToCliqueRatings(cliqueId, (ratings) => {
      set({ ratings });
      const { rawVenues, sortBy, filterTags } = get();
      const computed = computeVenueStats(rawVenues, ratings);
      set({ venues: applyFiltersAndSort(computed, filterTags, sortBy) });
    });
    
    set({ unsubscribeVenues, unsubscribeRatings });
  },

  cleanup: () => {
    const { unsubscribeVenues, unsubscribeRatings } = get();
    if (unsubscribeVenues) unsubscribeVenues();
    if (unsubscribeRatings) unsubscribeRatings();
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
      console.error('addVenueManually error:', error);
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
      console.error('addRatingManually error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    const { venues: computed, filterTags } = get();
    const filtered = applyFiltersAndSort(computed, filterTags, sortBy);
    set({ venues: filtered });
  },

  setFilterTags: (filterTags) => {
    set({ filterTags });
    const { venues: computed, sortBy } = get();
    const filtered = applyFiltersAndSort(computed, filterTags, sortBy);
    set({ venues: filtered });
  },

  getFilteredAndSortedVenues: () => {
    const { venues } = get();
    return venues;
  },
}));

// Helper: compute average rating, count, last visit date for each venue
function computeVenueStats(venues: Venue[], ratings: Rating[]): VenueWithStats[] {
  const ratingMap = new Map<string, { sum: number; count: number; lastDate: Date | null }>();
  for (const r of ratings) {
    const existing = ratingMap.get(r.venueId) || { sum: 0, count: 0, lastDate: null };
    const newSum = existing.sum + r.rating;
    const newCount = existing.count + 1;
    const rDate = r.visitedDate.toDate();
    const newLastDate = existing.lastDate && rDate < existing.lastDate ? existing.lastDate : rDate;
    ratingMap.set(r.venueId, { sum: newSum, count: newCount, lastDate: newLastDate });
  }
  return venues.map(v => {
    const stats = ratingMap.get(v.id!) || { sum: 0, count: 0, lastDate: null };
    return {
      ...v,
      averageRating: stats.count === 0 ? 0 : stats.sum / stats.count,
      ratingsCount: stats.count,
      lastVisitDate: stats.lastDate,
    };
  });
}

function applyFiltersAndSort(venues: VenueWithStats[], filterTags: string[], sortBy: SortOption): VenueWithStats[] {
  let filtered = venues;
  if (filterTags.length > 0) {
    // For MVP, tag filtering skipped because tags are per‑rating, not per‑venue.
    // In a future version you could aggregate tags on venues.
    filtered = venues; 
  }
  switch (sortBy) {
    case 'rating_desc':
      return [...filtered].sort((a,b) => b.averageRating - a.averageRating);
    case 'latest_visit':
      return [...filtered].sort((a,b) => (b.lastVisitDate?.getTime() || 0) - (a.lastVisitDate?.getTime() || 0));
    case 'name_asc':
      return [...filtered].sort((a,b) => a.name.localeCompare(b.name));
    default:
      return filtered;
  }
}