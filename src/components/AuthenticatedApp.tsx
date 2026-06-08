// src/components/AuthenticatedApp.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import CliqueManager from './CliqueManager';
import MapView from './MapView';

export default function AuthenticatedApp() {
  const { user, logOut } = useAuthStore();
  const { currentClique, loadUserCliques, setCurrentClique } = useCliqueStore();

  useEffect(() => {
    if (user) {
      loadUserCliques(user.uid);
    }
  }, [user]);

  if (!currentClique) {
    return <CliqueManager onCliqueSelected={() => {}} />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '1rem', 
        background: '#333', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Clique Reviews – Nairobi</h1>
          {currentClique && (
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Clique: {currentClique.name} (code: {currentClique.inviteCode})
            </div>
          )}
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
      <MapView />
    </div>
  );
}