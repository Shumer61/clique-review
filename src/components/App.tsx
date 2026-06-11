import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import Auth from './Auth';
import AuthenticatedApp from './AuthenticatedApp';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function App() {
  const { user, loading, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return <AuthenticatedApp />;
}