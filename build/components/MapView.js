import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/MapView.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import { useCliqueStore } from '../store/cliqueStore';
import { useLocationStore } from '../store/locationStore';
import { useStatusStore } from '../store/statusStore';
import { useAuthStore } from '../store/authStore';
import { listenToCliqueLocations } from '../services/location';
import PostStatusModal from './PostStatusModal';
import StatusPopup from './StatusPopup';
// ─── Constants ────────────────────────────────────────────────────────────────
const NAIROBI_CENTER = [36.8219, -1.2921];
const NAIROBI_BBOX = '36.6,-1.5,37.0,-1.1';
const DEFAULT_ZOOM = 12;
const FOCUS_ZOOM = 14;
// ─── Geocoder API ─────────────────────────────────────────────────────────────
const geocoderApi = {
    forwardGeocode: async (config) => {
        const query = typeof config.query === 'string' ? config.query : '';
        if (!query)
            return { type: 'FeatureCollection', features: [] };
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=geojson&limit=10&viewbox=${NAIROBI_BBOX}&bounded=1`;
        const res = await fetch(url);
        const data = await res.json();
        return {
            type: 'FeatureCollection',
            features: (data.features ?? []).map((f) => ({
                type: 'Feature',
                geometry: f.geometry,
                properties: f.properties,
                center: f.geometry.coordinates,
                place_name: f.properties.display_name,
            })),
        };
    },
};
// ─── Component ────────────────────────────────────────────────────────────────
export default function MapView({ onLocationSelect }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    // Refs to prevent stale closures in map event handlers
    const isSharingRef = useRef(false);
    const setManualLocationRef = useRef(async () => { });
    const setStatusPositionRef = useRef(() => { });
    const setShowStatusModalRef = useRef(() => { });
    const messagesRef = useRef([]);
    const { currentClique } = useCliqueStore();
    const { setManualLocation, isSharing, currentLocation } = useLocationStore();
    const { user } = useAuthStore();
    const { messages, subscribeToStatus, addStatus } = useStatusStore();
    const [locations, setLocations] = useState([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusPosition, setStatusPosition] = useState(null);
    // Clicked status bubble → show React overlay
    const [activeStatusMessage, setActiveStatusMessage] = useState(null);
    // Keep refs current
    useEffect(() => { isSharingRef.current = isSharing; }, [isSharing]);
    useEffect(() => { setManualLocationRef.current = setManualLocation; }, [setManualLocation]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { setStatusPositionRef.current = setStatusPosition; }, []);
    useEffect(() => { setShowStatusModalRef.current = setShowStatusModal; }, []);
    // Subscriptions
    useEffect(() => {
        if (!currentClique?.id)
            return;
        return listenToCliqueLocations(currentClique.id, setLocations);
    }, [currentClique?.id]);
    useEffect(() => {
        if (!currentClique?.id)
            return;
        return subscribeToStatus(currentClique.id);
    }, [currentClique?.id, subscribeToStatus]);
    // ── Map init (once) ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainer.current || map.current)
            return;
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
            // User location circles
            theMap.addLayer({
                id: 'user-locations-layer',
                type: 'circle',
                source: 'user-locations',
                paint: {
                    'circle-radius': 12,
                    'circle-color': ['get', 'color'],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#1D0A2E',
                },
            });
            // Status message circles
            theMap.addLayer({
                id: 'status-circles',
                type: 'circle',
                source: 'status-messages',
                paint: {
                    'circle-radius': 16,
                    'circle-color': '#2E1245',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#E8B86D',
                },
            });
            // Status message emoji label
            theMap.addLayer({
                id: 'status-text',
                type: 'symbol',
                source: 'status-messages',
                layout: {
                    'text-field': '💬',
                    'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                    'text-size': 14,
                },
            });
            // Maplibre popup for user location dot clicks
            const popup = new maplibregl.Popup({ offset: 25, className: 'uk-map-popup' });
            theMap.on('click', 'user-locations-layer', (e) => {
                if (!e.features?.length)
                    return;
                const props = e.features[0].properties;
                const coords = e.features[0].geometry.coordinates.slice();
                const time = new Date(props.updatedAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const latest = messagesRef.current.find(m => m.userId === props.userId);
                const html = `
          <div style="font-family:Inter,system-ui;padding:2px 0">
            <div style="color:#E8B86D;font-weight:600;margin-bottom:2px">${props.userId}</div>
            <div style="color:#9B8FAD;font-size:11px">Last seen ${time}</div>
            ${latest ? `<div style="color:#F0EAD6;margin-top:6px;font-size:12px">${latest.text}</div>` : ''}
          </div>`;
                popup.setLngLat(coords).setHTML(html).addTo(theMap);
            });
            // Status bubble click → open React overlay
            theMap.on('click', 'status-circles', (e) => {
                if (!e.features?.length)
                    return;
                const msgId = e.features[0].properties?.id;
                const msg = messagesRef.current.find(m => m.id === msgId);
                if (msg)
                    setActiveStatusMessage(msg);
            });
            theMap.on('mouseenter', 'user-locations-layer', () => { theMap.getCanvas().style.cursor = 'pointer'; });
            theMap.on('mouseleave', 'user-locations-layer', () => { theMap.getCanvas().style.cursor = ''; });
            theMap.on('mouseenter', 'status-circles', () => { theMap.getCanvas().style.cursor = 'pointer'; });
            theMap.on('mouseleave', 'status-circles', () => { theMap.getCanvas().style.cursor = ''; });
            // Left-click on map → set manual location
            theMap.on('click', async (e) => {
                if (!isSharingRef.current)
                    return;
                const { lng, lat } = e.lngLat;
                if (confirm(`Set your location to ${lat.toFixed(4)}, ${lng.toFixed(4)}?`)) {
                    await setManualLocationRef.current(lat, lng);
                }
            });
            // Right-click → post status
            theMap.on('contextmenu', (e) => {
                if (!isSharingRef.current) {
                    alert('Enable location sharing to post a status');
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
            geocoder.on('result', (e) => {
                const { center, place_name } = e.result;
                if (onLocationSelect && center?.length >= 2) {
                    onLocationSelect(center[1], center[0], place_name ?? '');
                }
            });
            setMapLoaded(true);
        });
        return () => { map.current?.remove(); map.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ── Sync user-locations source ────────────────────────────────────────────
    useEffect(() => {
        if (!map.current || !mapLoaded)
            return;
        const source = map.current.getSource('user-locations');
        source?.setData({
            type: 'FeatureCollection',
            features: locations.map(loc => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] },
                properties: { userId: loc.userId, color: loc.color, updatedAt: loc.updatedAt.seconds },
            })),
        });
    }, [locations, mapLoaded]);
    // ── Sync status-messages source ───────────────────────────────────────────
    useEffect(() => {
        if (!map.current || !mapLoaded)
            return;
        const source = map.current.getSource('status-messages');
        source?.setData({
            type: 'FeatureCollection',
            features: messages.map(msg => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [msg.lng, msg.lat] },
                // Store the message id in properties so click handler can look it up
                properties: { id: msg.id, text: msg.text },
            })),
        });
    }, [messages, mapLoaded]);
    // ── Fly to current location ───────────────────────────────────────────────
    useEffect(() => {
        if (!map.current || !mapLoaded || !currentLocation)
            return;
        map.current.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: FOCUS_ZOOM });
    }, [mapLoaded, currentLocation]);
    // ── Post status handler ───────────────────────────────────────────────────
    const handlePostStatus = useCallback((text) => {
        if (!user || !currentClique?.id || !statusPosition)
            return;
        const { uid } = user;
        const { lat, lng, venueId } = statusPosition;
        addStatus(uid, currentClique.id, lat, lng, text, venueId).catch(console.error);
        setStatusPosition(null);
        setShowStatusModal(false);
    }, [user, currentClique?.id, statusPosition, addStatus]);
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
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: mapContainer, style: { height: '100%', width: '100%' } }), isSharing && (_jsxs(_Fragment, { children: [_jsx("button", { "aria-label": "Post a status", onClick: handleOpenStatusModal, style: fabStyle('#E8B86D', '#1D0A2E', '80px', '56px', '22px'), children: "\uD83D\uDCAC" }), _jsx("button", { "aria-label": "Center map on my location", onClick: handleCenterOnMe, style: fabStyle('#2E1245', '#E8B86D', '148px', '44px', '18px'), children: "\uD83E\uDDED" })] })), showStatusModal && statusPosition && (_jsx(PostStatusModal, { onClose: () => setShowStatusModal(false), onPost: handlePostStatus })), activeStatusMessage && (_jsx(StatusPopup, { message: activeStatusMessage, onClose: () => setActiveStatusMessage(null) }))] }));
}
// ─── FAB style helper ─────────────────────────────────────────────────────────
function fabStyle(background, color, bottom, size, fontSize) {
    return {
        position: 'absolute',
        bottom,
        right: '20px',
        zIndex: 1000,
        background,
        color,
        border: 'none',
        borderRadius: '50%',
        width: size,
        height: size,
        fontSize,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
}
