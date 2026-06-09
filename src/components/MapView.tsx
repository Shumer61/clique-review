import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import { useCliqueStore } from '../store/cliqueStore';
import { useLocationStore } from '../store/locationStore';
import { useStatusStore } from '../store/statusStore';
import { useAuthStore } from '../store/authStore';
import { listenToCliqueLocations, UserLocation } from '../services/location';
import PostStatusModal from './PostStatusModal';

interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
}

const NAIROBI_BBOX = '36.6,-1.5,37.0,-1.1';

export default function MapView({ onLocationSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { currentClique } = useCliqueStore();
  const { setManualLocation, isSharing, currentLocation } = useLocationStore();
  const { user } = useAuthStore();
  const { messages, subscribeToStatus, addStatus } = useStatusStore();
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusPosition, setStatusPosition] = useState<{ lat: number; lng: number; venueId?: string } | null>(null);

  // Subscribe to clique member locations
  useEffect(() => {
    if (!currentClique?.id) return;
    const unsubscribe = listenToCliqueLocations(currentClique.id, (locs) => {
      setLocations(locs);
    });
    return () => unsubscribe();
  }, [currentClique]);

  // Subscribe to status messages
  useEffect(() => {
    if (!currentClique?.id) return;
    const unsubscribe = subscribeToStatus(currentClique.id);
    return unsubscribe;
  }, [currentClique, subscribeToStatus]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initMap = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
      center: [36.8219, -1.2921],
      zoom: 12,
    });

    map.current = initMap;
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
      const theMap = map.current;
      if (!theMap) return;

      // Geocoder (same as before)
      const geocoderApi = {
        forwardGeocode: async (config: any) => {
          const query = config.query;
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=geojson&limit=10&viewbox=${NAIROBI_BBOX}&bounded=1`;
          const res = await fetch(url);
          const data = await res.json();
          return {
            type: 'FeatureCollection' as const,
            features: data.features.map((f: any) => ({
              type: 'Feature' as const,
              geometry: f.geometry,
              properties: f.properties,
              center: f.geometry.coordinates,
              place_name: f.properties.display_name,
            })),
          };
        },
      };
      const geocoder = new MaplibreGeocoder(geocoderApi, {
        maplibregl: maplibregl,
        placeholder: 'Search for a venue in Nairobi...',
      });
      theMap.addControl(geocoder, 'top-left');

      geocoder.on('result', (e: any) => {
        const { center, place_name } = e.result;
        if (onLocationSelect && center?.length >= 2) {
          onLocationSelect(center[1], center[0], place_name);
        }
      });

      // Source for user locations
      theMap.addSource('user-locations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      theMap.addLayer({
        id: 'user-locations-layer',
        type: 'circle',
        source: 'user-locations',
        paint: {
          'circle-radius': 12,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Popup for user locations
      const popup = new maplibregl.Popup({ offset: 25 });
      theMap.on('click', 'user-locations-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        const date = new Date(props.updatedAt * 1000).toLocaleTimeString();
        let html = `<strong>${props.userId}</strong><br/>Last seen: ${date}`;
        // Add recent status messages for this user
        const userMessages = messages.filter(m => m.userId === props.userId);
        if (userMessages.length) {
          html += '<br/><strong>Latest status:</strong> ' + userMessages[0].text;
        }
        popup.setLngLat(coordinates).setHTML(html).addTo(theMap);
      });

      theMap.on('mouseenter', 'user-locations-layer', () => {
        theMap.getCanvas().style.cursor = 'pointer';
      });
      theMap.on('mouseleave', 'user-locations-layer', () => {
        theMap.getCanvas().style.cursor = '';
      });

      // Add source for status messages (bubbles)
      theMap.addSource('status-messages', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      theMap.addLayer({
        id: 'status-messages-layer',
        type: 'symbol',
        source: 'status-messages',
        layout: {
          'text-field': ['get', 'text'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, -1.5],
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 2,
        },
      });

      // Manual location setter
      theMap.on('click', async (e) => {
        if (!isSharing) {
          alert('Please enable "Share location" first');
          return;
        }
        const { lng, lat } = e.lngLat;
        if (confirm(`Set your location to ${lat.toFixed(4)}, ${lng.toFixed(4)}?`)) {
          await setManualLocation(lat, lng);
          alert('Location updated!');
        }
      });

      // Long press / context menu for posting status (right-click)
      theMap.on('contextmenu', (e) => {
        if (!isSharing) {
          alert('Enable location sharing to post status');
          return;
        }
        const { lng, lat } = e.lngLat;
        setStatusPosition({ lat, lng });
        setShowStatusModal(true);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onLocationSelect, setManualLocation, isSharing, messages]);

  // Update user locations source
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource('user-locations');
    if (!source) return;
    const features = locations.map(loc => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [loc.lng, loc.lat],
      },
      properties: {
        userId: loc.userId,
        color: loc.color,
        updatedAt: loc.updatedAt.seconds,
      },
    }));
    (source as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features,
    });
  }, [locations, mapLoaded]);

  // Update status messages source
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource('status-messages');
    if (!source) return;
    const features = messages.map(msg => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [msg.lng, msg.lat],
      },
      properties: {
        text: msg.text,
      },
    }));
    (source as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features,
    });
  }, [messages, mapLoaded]);

  // Center map on user's own location after map loads
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    if (currentLocation) {
      map.current.flyTo({
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 14,
      });
    }
  }, [mapLoaded, currentLocation]);

  const handlePostStatus = async (text: string) => {
    if (!user || !currentClique || !statusPosition) return;
    await addStatus(
      user.uid,
      currentClique.id,
      statusPosition.lat,
      statusPosition.lng,
      text,
      statusPosition.venueId
    );
    setStatusPosition(null);
  };

  return (
    <>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      {isSharing && (
        <button
          onClick={() => {
            if (currentLocation) {
              setStatusPosition({ lat: currentLocation.lat, lng: currentLocation.lng });
              setShowStatusModal(true);
            } else {
              alert('Your location is not set yet. Click on the map to set it first.');
            }
          }}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            zIndex: 1000,
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          💬
        </button>
      )}
      {showStatusModal && (
        <PostStatusModal
          onClose={() => setShowStatusModal(false)}
          onPost={handlePostStatus}
        />
      )}
    </>
  );
}