// src/components/MapView.tsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useAuthStore } from '../store/authStore';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { logOut, user } = useAuthStore();

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
      center: [36.8219, -1.2921],
      zoom: 12
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Clique Reviews – Nairobi</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>{user?.email}</span>
          <button onClick={logOut} style={{ padding: '0.25rem 0.5rem' }}>Logout</button>
        </div>
      </header>
      <div ref={mapContainer} style={{ flex: 1 }} />
    </div>
  );
}