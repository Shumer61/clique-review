import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

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
      <header style={{ padding: '1rem', background: '#333', color: 'white' }}>
        <h1>Clique Reviews – Nairobi</h1>
      </header>
      <div ref={mapContainer} style={{ flex: 1 }} />
    </div>
  );
}