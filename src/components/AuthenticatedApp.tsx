import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useLocationStore } from '../store/locationStore';
import CliqueManager from './CliqueManager';
import MapView from './MapView';
import VenueList from './VenueList';
import AddVenueModal from './AddVenueModal';
import Feed from './Feed';

export default function AuthenticatedApp() {
  const { user, logOut } = useAuthStore();
  const { currentClique, loadUserCliques, setCurrentClique } = useCliqueStore();
  const { isSharing, startSharing, stopSharing, currentLocation } = useLocationStore();
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [showFeed, setShowFeed] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserCliques(user.uid);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (isSharing) stopSharing();
    };
  }, []);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setPendingLocation({ lat, lng, address });
    setShowAddVenue(true);
  };

  if (!currentClique) {
    return <CliqueManager onCliqueSelected={() => {}} />;
  }

  const handleLogout = async () => {
    if (isSharing) await stopSharing();
    await logOut();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <header style={{ 
        padding: '0.75rem 1rem', 
        background: '#333', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        zIndex: 10
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Clique Reviews – Nairobi</h1>
          <div style={{ fontSize: '0.75rem' }}>
            Clique: {currentClique.name} (code: {currentClique.inviteCode})
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem' }}>{user?.email}</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
            <input
              type="checkbox"
              checked={isSharing}
              onChange={async (e) => {
                if (e.target.checked) {
                  startSharing();
                } else {
                  await stopSharing();
                }
              }}
            />
            Share location
          </label>
          {currentLocation && (
            <span style={{ fontSize: '0.7rem', background: '#555', padding: '2px 6px', borderRadius: '4px' }}>
              📍 Location active
            </span>
          )}
          <button onClick={() => setShowFeed(!showFeed)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
            {showFeed ? 'Hide Feed' : 'Show Feed'}
          </button>
          <button onClick={() => setCurrentClique(null)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
            Switch Clique
          </button>
          <button onClick={handleLogout} style={{ padding: '0.25rem 0.5rem', background: '#c00', color: 'white', border: 'none', fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>
      </header>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView onLocationSelect={handleLocationSelect} />
        {showFeed && <Feed />}
        <VenueList onAddVenue={() => setShowAddVenue(true)} />
      </div>
      {showAddVenue && (
        <AddVenueModal 
          onClose={() => { setShowAddVenue(false); setPendingLocation(null); }} 
          initialLocation={pendingLocation}
        />
      )}
    </div>
  );
}