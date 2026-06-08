import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import CliqueManager from './CliqueManager';
import MapView from './MapView';
import VenueList from './VenueList';
import AddVenueModal from './AddVenueModal';

export default function AuthenticatedApp() {
  const { user, logOut } = useAuthStore();
  const { currentClique, loadUserCliques, setCurrentClique } = useCliqueStore();
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);

  // Load user's cliques when user changes
  useEffect(() => {
    if (user) {
      console.log('[AuthenticatedApp] Loading cliques for user:', user.uid);
      loadUserCliques(user.uid);
    }
  }, [user]);

  // Log when current clique changes
  useEffect(() => {
    console.log('[AuthenticatedApp] currentClique changed:', currentClique);
  }, [currentClique]);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    console.log('[AuthenticatedApp] Location selected:', { lat, lng, address });
    setPendingLocation({ lat, lng, address });
    setShowAddVenue(true);
  };

  if (!currentClique) {
    console.log('[AuthenticatedApp] No clique selected – showing CliqueManager');
    return <CliqueManager onCliqueSelected={() => {}} />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <header style={{ 
        padding: '1rem', 
        background: '#333', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        zIndex: 10
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Clique Reviews – Nairobi</h1>
          <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Clique: {currentClique.name} (code: {currentClique.inviteCode})
          </div>
        </div>
        <div>
          <span style={{ marginRight: '1rem' }}>{user?.email}</span>
          <button 
            onClick={() => setCurrentClique(null)} 
            style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}
          >
            Switch Clique
          </button>
          <button 
            onClick={logOut} 
            style={{ padding: '0.25rem 0.5rem', background: '#c00', color: 'white', border: 'none' }}
          >
            Logout
          </button>
        </div>
      </header>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView onLocationSelect={handleLocationSelect} />
        <VenueList onAddVenue={() => setShowAddVenue(true)} />
      </div>
      {showAddVenue && (
        <AddVenueModal 
          onClose={() => {
            setShowAddVenue(false);
            setPendingLocation(null);
          }} 
          initialLocation={pendingLocation}
        />
      )}
    </div>
  );
}