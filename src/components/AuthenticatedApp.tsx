// src/components/AuthenticatedApp.tsx
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
  const [showFeed, setShowFeed] = useState(false);

  useEffect(() => {
    if (user) loadUserCliques(user.uid);
  }, [user]);

  useEffect(() => {
    return () => { if (isSharing) stopSharing(); };
  }, []);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setPendingLocation({ lat, lng, address });
    setShowAddVenue(true);
  };

  const handleLogout = async () => {
    if (isSharing) await stopSharing();
    await logOut();
  };

  if (!currentClique) {
    return <CliqueManager onCliqueSelected={() => {}} />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: '#1D0A2E' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        padding: '0.6rem 1rem',
        background: '#1D0A2E',
        borderBottom: '0.5px solid rgba(232,184,109,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Left: brand + clique */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🌙</span>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#9B8FAD', letterSpacing: '0.06em' }}>CLIQUE REVIEWS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#E8B86D', fontSize: '0.95rem' }}>
                {currentClique.name}
              </span>
              <span style={{
                fontSize: '0.7rem',
                background: 'rgba(155,143,173,0.15)',
                color: '#9B8FAD',
                border: '0.5px solid rgba(232,184,109,0.15)',
                borderRadius: '20px',
                padding: '1px 8px',
                letterSpacing: '0.08em',
              }}>
                {currentClique.inviteCode}
              </span>
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#9B8FAD' }}>{user?.email}</span>

          {/* Share location toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            color: isSharing ? '#E8B86D' : '#9B8FAD',
            cursor: 'pointer',
            userSelect: 'none',
          }}>
            <div style={{
              width: '32px',
              height: '18px',
              borderRadius: '9px',
              background: isSharing ? '#E8B86D' : 'rgba(155,143,173,0.25)',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '2px',
                left: isSharing ? '16px' : '2px',
                transition: 'left 0.2s',
              }} />
              <input
                type="checkbox"
                checked={isSharing}
                onChange={async e => { if (e.target.checked) startSharing(); else await stopSharing(); }}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
            </div>
            {isSharing ? '📍 Sharing' : 'Share location'}
          </label>

          <button
            onClick={() => setShowFeed(f => !f)}
            style={{
              background: showFeed ? 'rgba(232,184,109,0.12)' : 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(232,184,109,0.2)',
              borderRadius: '6px',
              color: showFeed ? '#E8B86D' : '#9B8FAD',
              fontSize: '0.78rem',
              padding: '0.3rem 0.65rem',
              cursor: 'pointer',
            }}
          >
            {showFeed ? 'Hide feed' : 'Feed'}
          </button>

          <button
            onClick={() => setCurrentClique(null)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(232,184,109,0.15)',
              borderRadius: '6px',
              color: '#9B8FAD',
              fontSize: '0.78rem',
              padding: '0.3rem 0.65rem',
              cursor: 'pointer',
            }}
          >
            Switch
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(226,75,74,0.12)',
              border: '0.5px solid rgba(226,75,74,0.25)',
              borderRadius: '6px',
              color: '#E24B4A',
              fontSize: '0.78rem',
              padding: '0.3rem 0.65rem',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Map area ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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