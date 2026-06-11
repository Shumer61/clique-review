import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const [showFeed, setShowFeed] = useState(true);
    useEffect(() => {
        if (user) {
            loadUserCliques(user.uid);
        }
    }, [user]);
    useEffect(() => {
        return () => {
            if (isSharing)
                stopSharing();
        };
    }, []);
    const handleLocationSelect = (lat, lng, address) => {
        setPendingLocation({ lat, lng, address });
        setShowAddVenue(true);
    };
    if (!currentClique) {
        return _jsx(CliqueManager, { onCliqueSelected: () => { } });
    }
    const handleLogout = async () => {
        if (isSharing)
            await stopSharing();
        await logOut();
    };
    return (_jsxs("div", { style: { height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }, children: [_jsxs("header", { style: {
                    padding: '0.75rem 1rem',
                    background: '#333',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    zIndex: 10
                }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: 0, fontSize: '1.2rem' }, children: "Clique Reviews \u2013 Nairobi" }), _jsxs("div", { style: { fontSize: '0.75rem' }, children: ["Clique: ", currentClique.name, " (code: ", currentClique.inviteCode, ")"] })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx("span", { style: { fontSize: '0.85rem' }, children: user?.email }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }, children: [_jsx("input", { type: "checkbox", checked: isSharing, onChange: async (e) => {
                                            if (e.target.checked) {
                                                startSharing();
                                            }
                                            else {
                                                await stopSharing();
                                            }
                                        } }), "Share location"] }), currentLocation && (_jsx("span", { style: { fontSize: '0.7rem', background: '#555', padding: '2px 6px', borderRadius: '4px' }, children: "\uD83D\uDCCD Location active" })), _jsx("button", { onClick: () => setShowFeed(!showFeed), style: { padding: '0.25rem 0.5rem', fontSize: '0.8rem' }, children: showFeed ? 'Hide Feed' : 'Show Feed' }), _jsx("button", { onClick: () => setCurrentClique(null), style: { padding: '0.25rem 0.5rem', fontSize: '0.8rem' }, children: "Switch Clique" }), _jsx("button", { onClick: handleLogout, style: { padding: '0.25rem 0.5rem', background: '#c00', color: 'white', border: 'none', fontSize: '0.8rem' }, children: "Logout" })] })] }), _jsxs("div", { style: { flex: 1, position: 'relative' }, children: [_jsx(MapView, { onLocationSelect: handleLocationSelect }), showFeed && _jsx(Feed, {}), _jsx(VenueList, { onAddVenue: () => setShowAddVenue(true) })] }), showAddVenue && (_jsx(AddVenueModal, { onClose: () => { setShowAddVenue(false); setPendingLocation(null); }, initialLocation: pendingLocation }))] }));
}
