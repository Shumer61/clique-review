// src/components/App.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import Auth from './Auth';
import AuthenticatedApp from './AuthenticatedApp';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../usiku.css';

export default function App() {
  const { user, loading, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1D0A2E',
        color: '#E8B86D',
        gap: '1rem',
      }}>
        <div style={{ fontSize: '2rem' }}>🌙</div>
        <div style={{ fontSize: '0.9rem', color: '#9B8FAD', letterSpacing: '0.1em' }}>LOADING...</div>
      </div>
    );
  }

  if (!user) return <Auth />;
  return <AuthenticatedApp />;
}