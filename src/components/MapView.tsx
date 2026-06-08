import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import { useGeolocation } from '../hooks/useGeolocation';

interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
}

const NAIROBI_BBOX = '36.6,-1.5,37.0,-1.1';

export default function MapView({ onLocationSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { lat, lng, loading: geoLoading, getCurrentPosition } = useGeolocation();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
      center: [36.8219, -1.2921],
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      const geocoderApi = {
        forwardGeocode: async (config: any) => {
          const query = config.query;
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=geojson&limit=10&viewbox=${NAIROBI_BBOX}&bounded=1`;
          const response = await fetch(url);
          const data = await response.json();
          return {
            type: 'FeatureCollection' as const,
            features: data.features.map((feature: any) => ({
              type: 'Feature' as const,
              geometry: feature.geometry,
              properties: feature.properties,
              center: feature.geometry.coordinates,
              place_name: feature.properties.display_name,
            })),
          };
        },
      };

      const geocoder = new MaplibreGeocoder(geocoderApi, {
        maplibregl: maplibregl,
        placeholder: 'Search for a venue in Nairobi...',
      });

      map.current.addControl(geocoder, 'top-left');

      geocoder.on('result', (e: any) => {
        const { center, place_name } = e.result;
        if (onLocationSelect && center && center.length >= 2) {
          onLocationSelect(center[1], center[0], place_name);
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onLocationSelect]);

  useEffect(() => {
    if (lat !== null && lng !== null && map.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 15 });
      if (onLocationSelect) {
        onLocationSelect(lat, lng, 'Your current location');
      }
    }
  }, [lat, lng, onLocationSelect]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      <button
        onClick={getCurrentPosition}
        disabled={geoLoading}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '8px 12px',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {geoLoading ? 'Getting location...' : '📍 Use my location'}
      </button>
    </div>
  );
}