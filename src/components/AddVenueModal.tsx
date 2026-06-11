// src/components/AddVenueModal.tsx
import { useState, useEffect } from 'react';
import { GeoPoint } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useVenueStore } from '../store/venueStore';

interface AddVenueModalProps {
  onClose: () => void;
  initialLocation?: { lat: number; lng: number; address?: string } | null;
}

export default function AddVenueModal({ onClose, initialLocation }: AddVenueModalProps) {
  const { user } = useAuthStore();
  const { currentClique } = useCliqueStore();
  const { addVenueManually, loading } = useVenueStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLat(initialLocation.lat);
      setSelectedLng(initialLocation.lng);
      if (initialLocation.address) setAddress(initialLocation.address);
    } else {
      setSelectedLat(null);
      setSelectedLng(null);
      setAddress('');
    }
    setName('');
  }, [initialLocation]);

  const handleSubmit = async () => {
    if (!user || !currentClique) return;
    if (!selectedLat || !selectedLng) {
      alert('Please select a location using the map search first.');
      return;
    }
    if (!name.trim()) {
      alert('Please enter a venue name.');
      return;
    }
    try {
      await addVenueManually({
        name: name.trim(),
        address: address.trim() || `${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`,
        location: new GeoPoint(selectedLat, selectedLng),
        addedBy: user.uid,
        addedByCliqueId: currentClique.id!,
      });
      onClose();
    } catch (err: any) {
      alert('Failed to add venue: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="uk-overlay">
      <div className="uk-modal">
        <h2 className="uk-heading" style={{ marginBottom: '0.25rem' }}>Add New Venue</h2>
        <p style={{ fontSize: '0.82rem', color: '#9B8FAD', marginTop: 0, marginBottom: '1.25rem' }}>
          Use the map search (top-left) to pin a location, then fill in the details below.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label className="uk-label">Venue name *</label>
            <input
              className="uk-input"
              placeholder="e.g. Mercury Lounge"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="uk-label">Address</label>
            <input
              className="uk-input"
              placeholder="Auto-filled from map search"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* Location indicator */}
          <div style={{
            background: '#2A1040',
            border: `0.5px solid ${selectedLat ? 'rgba(232,184,109,0.35)' : 'rgba(155,143,173,0.2)'}`,
            borderRadius: 'var(--uk-radius-sm)',
            padding: '0.6rem 0.75rem',
            fontSize: '0.82rem',
            color: selectedLat ? '#E8B86D' : '#9B8FAD',
          }}>
            {selectedLat && selectedLng
              ? `📍 ${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`
              : '📍 No location set — use map search'}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              className="uk-btn uk-btn-primary"
              onClick={handleSubmit}
              disabled={loading || !selectedLat || !selectedLng || !name.trim()}
              style={{ flex: 1 }}
            >
              {loading ? 'Saving...' : 'Add Venue'}
            </button>
            <button className="uk-btn uk-btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}