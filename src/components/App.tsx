// src/components/App.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import Auth from './Auth';
import MapView from './MapView';

export default function App() {
  const { user, loading, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <MapView />;
}