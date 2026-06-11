import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder, { MaplibreGeocoderApiConfig } from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import type { Point } from 'geojson';
import { useCliqueStore } from '../store/cliqueStore';
import { useLocationStore } from '../store/locationStore';
import { useStatusStore } from '../store/statusStore';
import { useAuthStore } from '../store/authStore';
import { listenToCliqueLocations, UserLocation } from '../services/location';
import PostStatusModal from './PostStatusModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

interface StatusPosition {
  lat: number;
  lng: number;
  venueId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAIROBI_CENTER: [number, number] = [36.8219, -1.2921];
const NAIROBI_BBOX = '36.6,-1.5,37.0,-1.1';
const DEFAULT_ZOOM = 12;
const FOCUS_ZOOM = 14;

// ─── Geocoder API (no component dependencies — defined once outside) ──────────

const geocoderApi = {
  forwardGeocode: async (config: MaplibreGeocoderApiConfig) => {
    const query = typeof config.query === 'string' ? config.query : '';
    if (!query) return { type: 'FeatureCollection' as const, features: [] };
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=geojson&limit=10&viewbox=${NAIROBI_BBOX}&bounded=1`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      type: 'FeatureCollection' as const,
      features: (data.features ?? []).map((f: any) => ({
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: f.properties,
        center: f.geometry.coordinates,
        place_name: f.properties.display_name,
      })),
    };
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView({ onLocationSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // ── Refs for values used inside map event handlers ────────────────────────
  // Using refs prevents stale closure bugs — handlers always read latest value
  const isSharingRef = useRef(false);
  const setManualLocationRef = useRef<(lat: number, lng: number) => Promise<void>>(async () => {});
  const setStatusPositionRef = useRef<(pos: StatusPosition) => void>(() => {});
  const setShowStatusModalRef = useRef<(show: boolean) => void>(() => {});
  const messagesRef = useRef<ReturnType<typeof useStatusStore.getState>['messages']>([]);

  const { currentClique } = useCliqueStore();
  const { setManualLocation, isSharing, currentLocation } = useLocationStore();
  const { user } = useAuthStore();
  const { messages, subscribeToStatus, addStatus } = useStatusStore();

  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusPosition, setStatusPosition] = useState<StatusPosition | null>(null);

  // ── Keep refs in sync with latest state/props ─────────────────────────────
  useEffect(() => { isSharingRef.current = isSharing; }, [isSharing]);
  useEffect(() => { setManualLocationRef.current = setManualLocation; }, [setManualLocation]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { setStatusPositionRef.current = setStatusPosition; }, []);
  useEffect(() => { setShowStatusModalRef.current = setShowStatusModal; }, []);

  // ── Subscribe to clique member locations ──────────────────────────────────
  useEffect(() => {
    if (!currentClique?.id) return;
    return listenToCliqueLocations(currentClique.id, setLocations);
  }, [currentClique?.id]);

  // ── Subscribe to status messages ──────────────────────────────────────────
  useEffect(() => {
    if (!currentClique?.id) return;
    return subscribeToStatus(currentClique.id);
  }, [currentClique?.id, subscribeToStatus]);

  // ── Initialize map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const theMap = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: NAIROBI_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.current = theMap;
    theMap.addControl(new maplibregl.NavigationControl(), 'top-right');

    theMap.on('load', () => {
      // Sources
      theMap.addSource('user-locations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      theMap.addSource('status-messages', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Layers
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
      theMap.addLayer({
        id: 'status-circles',
        type: 'circle',
        source: 'status-messages',
        paint: {
          'circle-radius': 15,
          'circle-color': '#ff4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      theMap.addLayer({
        id: 'status-text',
        type: 'symbol',
        source: 'status-messages',
        layout: {
          'text-field': ['get', 'text'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-offset': [0, -1.5],
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 2,
        },
      });

      // Popup on user location click
      const popup = new maplibregl.Popup({ offset: 25 });
      theMap.on('click', 'user-locations-layer', (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties as { userId: string; updatedAt: number };
        const coords = (e.features[0].geometry as Point).coordinates.slice() as [number, number];
        const time = new Date(props.updatedAt * 1000).toLocaleTimeString();
        // Read latest messages via ref — no stale closure
        const latest = messagesRef.current.find(m => m.userId === props.userId);
        const html = [
          `<strong>${props.userId}</strong>`,
          `Last seen: ${time}`,
          latest ? `<strong>Latest:</strong> ${latest.text}` : '',
        ].filter(Boolean).join('<br/>');
        popup.setLngLat(coords).setHTML(html).addTo(theMap);
      });

      theMap.on('mouseenter', 'user-locations-layer', () => {
        theMap.getCanvas().style.cursor = 'pointer';
      });
      theMap.on('mouseleave', 'user-locations-layer', () => {
        theMap.getCanvas().style.cursor = '';
      });

      // Left-click → set manual location (reads isSharing via ref)
      theMap.on('click', async (e) => {
        if (!isSharingRef.current) {
          alert('Please enable "Share location" first');
          return;
        }
        const { lng, lat } = e.lngLat;
        if (confirm(`Set your location to ${lat.toFixed(4)}, ${lng.toFixed(4)}?`)) {
          await setManualLocationRef.current(lat, lng);
          alert('Location updated! Others can now see you.');
        }
      });

      // Right-click → post status (reads isSharing via ref)
      theMap.on('contextmenu', (e) => {
        if (!isSharingRef.current) {
          alert('Enable location sharing to post status');
          return;
        }
        const { lng, lat } = e.lngLat;
        setStatusPositionRef.current({ lat, lng });
        setShowStatusModalRef.current(true);
      });

      // Geocoder
      const geocoder = new MaplibreGeocoder(geocoderApi, {
        maplibregl,
        placeholder: 'Search for a venue in Nairobi...',
      });
      theMap.addControl(geocoder, 'top-left');
      geocoder.on('result', (e: any) => {
        const { center, place_name } = e.result;
        if (onLocationSelect && center?.length >= 2) {
          onLocationSelect(center[1], center[0], place_name ?? '');
        }
      });

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // onLocationSelect is intentionally omitted — it never changes identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync user-locations source ────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource('user-locations') as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: 'FeatureCollection',
      features: locations.map(loc => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] },
        properties: { userId: loc.userId, color: loc.color, updatedAt: loc.updatedAt.seconds },
      })),
    });
  }, [locations, mapLoaded]);

  // ── Sync status-messages source ───────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource('status-messages') as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: 'FeatureCollection',
      features: messages.map(msg => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [msg.lng, msg.lat] },
        properties: { text: msg.text },
      })),
    });
  }, [messages, mapLoaded]);

  // ── Fly to current location ───────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentLocation) return;
    map.current.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: FOCUS_ZOOM });
  }, [mapLoaded, currentLocation]);

  // ── Post status handler ───────────────────────────────────────────────────
  const handlePostStatus = useCallback(
    (text: string) => {
      if (!user || !currentClique?.id || !statusPosition) return;
      const { uid } = user;
      const { lat, lng, venueId } = statusPosition;
      addStatus(uid, currentClique.id, lat, lng, text, venueId).catch(console.error);
      setStatusPosition(null);
      setShowStatusModal(false);
    },
    [user, currentClique?.id, statusPosition, addStatus]
  );

  // ── FAB handlers ──────────────────────────────────────────────────────────
  const handleOpenStatusModal = useCallback(() => {
    if (!currentLocation) {
      alert('First set your location by clicking on the map.');
      return;
    }
    setStatusPosition({ lat: currentLocation.lat, lng: currentLocation.lng });
    setShowStatusModal(true);
  }, [currentLocation]);

  const handleCenterOnMe = useCallback(() => {
    if (!currentLocation) {
      alert('Set your location by clicking on the map first.');
      return;
    }
    map.current?.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: FOCUS_ZOOM });
  }, [currentLocation]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />

      {isSharing && (
        <>
          <button
            aria-label="Post a status"
            onClick={handleOpenStatusModal}
            style={fabStyle('#007bff', '80px', '56px', '24px')}
          >
            💬
          </button>
          <button
            aria-label="Center map on my location"
            onClick={handleCenterOnMe}
            style={fabStyle('#555', '150px', '48px', '20px')}
          >
            🧭
          </button>
        </>
      )}

      {showStatusModal && statusPosition && (
        <PostStatusModal
          onClose={() => setShowStatusModal(false)}
          onPost={handlePostStatus}
        />
      )}
    </>
  );
}

// ─── Style helper ─────────────────────────────────────────────────────────────

function fabStyle(
  background: string,
  bottom: string,
  size: string,
  fontSize: string
): React.CSSProperties {
  return {
    position: 'absolute',
    bottom,
    right: '20px',
    zIndex: 1000,
    background,
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: size,
    height: size,
    fontSize,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  };
}