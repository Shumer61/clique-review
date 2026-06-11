// src/components/VenueList.tsx
import { useEffect, useState } from 'react';
import { useVenueStore, SortOption } from '../store/venueStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useAuthStore } from '../store/authStore';
import RatingModal from './RatingModal';

interface VenueListProps {
  onAddVenue: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'rating_desc', label: 'Highest rated' },
  { value: 'latest_visit', label: 'Most recent visit' },
  { value: 'name_asc', label: 'Name A-Z' },
];

export default function VenueList({ onAddVenue }: VenueListProps) {
  const { currentClique } = useCliqueStore();
  const { user } = useAuthStore();
  const { venues, sortBy, setSortBy, initLiveListeners, cleanup, deleteVenueById, loading } = useVenueStore();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (currentClique?.id) initLiveListeners(currentClique.id);
    return () => cleanup();
  }, [currentClique?.id]);

  if (!currentClique) return null;

  const handleRateClick = (venueId: string) => {
    setSelectedVenueId(venueId);
    setShowRatingModal(true);
  };

  const handleDeleteVenue = async (venueId: string, venueName: string) => {
    if (!confirm(`Delete "${venueName}"? This will also remove all its ratings and cannot be undone.`)) return;
    await deleteVenueById(venueId);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '100%',
      maxWidth: '400px',
      height: '50vh',
      background: 'white',
      boxShadow: '-2px -2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '1rem',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      pointerEvents: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Venues</h2>
        <button onClick={onAddVenue}>+ Add Venue</button>
      </div>

      {/* Sort */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {venues.length === 0 && (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>No venues yet. Click "+ Add Venue" to add the first one.</p>
      )}

      {venues.map(venue => {
        const isOwner = user?.uid === venue.addedBy;
        return (
          <div key={venue.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            {/* Venue name + delete button on same row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{venue.name}</h3>
              {isOwner && (
                <button
                  onClick={() => handleDeleteVenue(venue.id!, venue.name)}
                  disabled={loading}
                  aria-label={`Delete ${venue.name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#c00',
                    fontSize: '1rem',
                    padding: '0 0.25rem',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  🗑️
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#666' }}>{venue.address}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <strong>Avg rating:</strong>{' '}
              {venue.averageRating > 0 ? `${venue.averageRating.toFixed(1)} ★` : 'Not yet rated'}{' '}
              ({venue.ratingsCount})
            </div>
            <button
              onClick={() => handleRateClick(venue.id!)}
              style={{
                marginTop: '0.5rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Log a visit
            </button>
          </div>
        );
      })}

      {showRatingModal && selectedVenueId && (
        <RatingModal
          venueId={selectedVenueId}
          onClose={() => { setShowRatingModal(false); setSelectedVenueId(null); }}
        />
      )}
    </div>
  );
}