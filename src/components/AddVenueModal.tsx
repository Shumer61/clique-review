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
  const { createVenue, loading } = useVenueStore();
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
    console.log('=== AddVenueModal Debug ===');
    console.log('user:', user);
    console.log('currentClique:', currentClique);
    console.log('selectedLat, selectedLng:', selectedLat, selectedLng);
    console.log('name:', name);
    console.log('address:', address);

    if (!user || !currentClique) {
      alert('Missing user or clique. Please log out and back in.');
      return;
    }
    if (!selectedLat || !selectedLng) {
      alert('Please select a location using the map search or "Use my location" button.');
      return;
    }
    if (!name.trim()) {
      alert('Please enter a venue name.');
      return;
    }

    const venueData = {
      name: name.trim(),
      address: address.trim() || `${selectedLat}, ${selectedLng}`,
      location: new GeoPoint(selectedLat, selectedLng),
      addedBy: user.uid,
      addedByCliqueId: currentClique.id!,
    };
    console.log('Calling createVenue with:', venueData);
    try {
      await createVenue(venueData);
      console.log('Venue added successfully');
      onClose();
    } catch (err: any) {
      console.error('Error adding venue:', err);
      alert('Failed to add venue: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2>Add New Venue</h2>
        <p style={{ fontSize: '0.9rem', color: '#555' }}>
          Use the map search (top‑left) or click <strong>📍 Use my location</strong> to set coordinates.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Venue name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Address (optional, auto‑filled from search)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem', background: '#f0f0f0', padding: '0.5rem', borderRadius: '4px' }}>
          <strong>Selected location:</strong><br />
          {selectedLat && selectedLng ? (
            <span>Lat {selectedLat.toFixed(5)}, Lng {selectedLng.toFixed(5)}</span>
          ) : (
            <span style={{ color: '#999' }}>Not set – use map search or location button</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSubmit} disabled={loading || !selectedLat || !selectedLng}>
            {loading ? 'Saving...' : 'Add Venue'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}