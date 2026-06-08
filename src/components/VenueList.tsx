import { useEffect, useState } from 'react';
import { useVenueStore } from '../store/venueStore';
import { useCliqueStore } from '../store/cliqueStore';
import RatingModal from './RatingModal';

interface VenueListProps {
  onAddVenue: () => void;
}

export default function VenueList({ onAddVenue }: VenueListProps) {
  const { currentClique } = useCliqueStore();
  const { venues, ratings, loadVenues, loadRatings, getAverageRatingForVenue, loading } = useVenueStore();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (currentClique?.id) {
      console.log('[VenueList] Loading venues for clique:', currentClique.id, currentClique.name);
      loadVenues(currentClique.id).then(() => {
        console.log('[VenueList] loadVenues completed, venues in store:', venues);
      }).catch(err => console.error('[VenueList] loadVenues error:', err));
      loadRatings(currentClique.id);
    } else {
      console.log('[VenueList] No current clique');
    }
  }, [currentClique]);

  if (!currentClique) return null;

  const handleRateClick = (venueId: string) => {
    setSelectedVenueId(venueId);
    setShowRatingModal(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '350px',
      height: '100vh',
      background: 'white',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '1rem',
      pointerEvents: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Venues</h2>
        <button onClick={onAddVenue}>+ Add Venue</button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {venues.length === 0 && !loading && (
        <p>No venues yet. Click "Add Venue" to add the first one.</p>
      )}
      
      {venues.map(venue => {
        const avgRating = getAverageRatingForVenue(venue.id!);
        const venueRatings = ratings.filter(r => r.venueId === venue.id);
        return (
          <div key={venue.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: '0 0 0.25rem 0' }}>{venue.name}</h3>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{venue.address}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <strong>Avg rating:</strong> {avgRating > 0 ? avgRating.toFixed(1) : 'Not yet rated'} ★ ({venueRatings.length})
            </div>
            <button 
              onClick={() => handleRateClick(venue.id!)}
              style={{ marginTop: '0.5rem', background: '#007bff', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
            >
              Log a visit
            </button>
          </div>
        );
      })}
      
      {showRatingModal && selectedVenueId && (
        <RatingModal
          venueId={selectedVenueId}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}