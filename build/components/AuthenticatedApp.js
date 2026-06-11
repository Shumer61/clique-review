import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/AuthenticatedApp.tsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useLocationStore } from '../store/locationStore';
import CliqueManager from './CliqueManager';
import MapView from './MapView';
import VenueList from './VenueList';
import AddVenueModal from './AddVenueModal';
import Feed from './Feed';
export default function AuthenticatedApp() {
    const { user, logOut } = useAuthStore();
    const { currentClique, loadUserCliques, setCurrentClique } = useCliqueStore();
    const { isSharing, startSharing, stopSharing, currentLocation } = useLocationStore();
    const [showAddVenue, setShowAddVenue] = useState(false);
    const [pendingLocation, setPendingLocation] = useState(null);
    const [showFeed, setShowFeed] = useState(false);
    useEffect(() => {
        if (user)
            loadUserCliques(user.uid);
    }, [user]);
    useEffect(() => {
        return () => { if (isSharing)
            stopSharing(); };
    }, []);
    const handleLocationSelect = (lat, lng, address) => {
        setPendingLocation({ lat, lng, address });
        setShowAddVenue(true);
    };
    const handleLogout = async () => {
        if (isSharing)
            await stopSharing();
        await logOut();
    };
    if (!currentClique) {
        return _jsx(CliqueManager, { onCliqueSelected: () => { } });
    }
    return (_jsxs("div", { style: { height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: '#1D0A2E' }, children: [_jsxs("header", { style: {
                    padding: '0.6rem 1rem',
                    background: '#1D0A2E',
                    borderBottom: '0.5px solid rgba(232,184,109,0.15)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    zIndex: 10,
                    flexShrink: 0,
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx("span", { style: { fontSize: '1.2rem' }, children: "\uD83C\uDF19" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.7rem', color: '#9B8FAD', letterSpacing: '0.06em' }, children: "CLIQUE REVIEWS" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx("span", { style: { fontWeight: 600, color: '#E8B86D', fontSize: '0.95rem' }, children: currentClique.name }), _jsx("span", { style: {
                                                    fontSize: '0.7rem',
                                                    background: 'rgba(155,143,173,0.15)',
                                                    color: '#9B8FAD',
                                                    border: '0.5px solid rgba(232,184,109,0.15)',
                                                    borderRadius: '20px',
                                                    padding: '1px 8px',
                                                    letterSpacing: '0.08em',
                                                }, children: currentClique.inviteCode })] })] })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#9B8FAD' }, children: user?.email }), _jsxs("label", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.78rem',
                                    color: isSharing ? '#E8B86D' : '#9B8FAD',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                }, children: [_jsxs("div", { style: {
                                            width: '32px',
                                            height: '18px',
                                            borderRadius: '9px',
                                            background: isSharing ? '#E8B86D' : 'rgba(155,143,173,0.25)',
                                            position: 'relative',
                                            transition: 'background 0.2s',
                                            flexShrink: 0,
                                        }, children: [_jsx("div", { style: {
                                                    width: '14px',
                                                    height: '14px',
                                                    borderRadius: '50%',
                                                    background: 'white',
                                                    position: 'absolute',
                                                    top: '2px',
                                                    left: isSharing ? '16px' : '2px',
                                                    transition: 'left 0.2s',
                                                } }), _jsx("input", { type: "checkbox", checked: isSharing, onChange: async (e) => { if (e.target.checked)
                                                    startSharing();
                                                else
                                                    await stopSharing(); }, style: { position: 'absolute', opacity: 0, width: 0, height: 0 } })] }), isSharing ? '📍 Sharing' : 'Share location'] }), _jsx("button", { onClick: () => setShowFeed(f => !f), style: {
                                    background: showFeed ? 'rgba(232,184,109,0.12)' : 'rgba(255,255,255,0.06)',
                                    border: '0.5px solid rgba(232,184,109,0.2)',
                                    borderRadius: '6px',
                                    color: showFeed ? '#E8B86D' : '#9B8FAD',
                                    fontSize: '0.78rem',
                                    padding: '0.3rem 0.65rem',
                                    cursor: 'pointer',
                                }, children: showFeed ? 'Hide feed' : 'Feed' }), _jsx("button", { onClick: () => setCurrentClique(null), style: {
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '0.5px solid rgba(232,184,109,0.15)',
                                    borderRadius: '6px',
                                    color: '#9B8FAD',
                                    fontSize: '0.78rem',
                                    padding: '0.3rem 0.65rem',
                                    cursor: 'pointer',
                                }, children: "Switch" }), _jsx("button", { onClick: handleLogout, style: {
                                    background: 'rgba(226,75,74,0.12)',
                                    border: '0.5px solid rgba(226,75,74,0.25)',
                                    borderRadius: '6px',
                                    color: '#E24B4A',
                                    fontSize: '0.78rem',
                                    padding: '0.3rem 0.65rem',
                                    cursor: 'pointer',
                                }, children: "Logout" })] })] }), _jsxs("div", { style: { flex: 1, position: 'relative', overflow: 'hidden' }, children: [_jsx(MapView, { onLocationSelect: handleLocationSelect }), showFeed && _jsx(Feed, {}), _jsx(VenueList, { onAddVenue: () => setShowAddVenue(true) })] }), showAddVenue && (_jsx(AddVenueModal, { onClose: () => { setShowAddVenue(false); setPendingLocation(null); }, initialLocation: pendingLocation }))] }));
}
