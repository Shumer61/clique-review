import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/AddVenueModal.tsx
import { useState, useEffect } from 'react';
import { GeoPoint } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useVenueStore } from '../store/venueStore';
export default function AddVenueModal({ onClose, initialLocation }) {
    const { user } = useAuthStore();
    const { currentClique } = useCliqueStore();
    const { addVenueManually, loading } = useVenueStore();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [selectedLat, setSelectedLat] = useState(null);
    const [selectedLng, setSelectedLng] = useState(null);
    useEffect(() => {
        if (initialLocation) {
            setSelectedLat(initialLocation.lat);
            setSelectedLng(initialLocation.lng);
            if (initialLocation.address)
                setAddress(initialLocation.address);
        }
        else {
            setSelectedLat(null);
            setSelectedLng(null);
            setAddress('');
        }
        setName('');
    }, [initialLocation]);
    const handleSubmit = async () => {
        if (!user || !currentClique)
            return;
        if (!selectedLat || !selectedLng) {
            alert('Please select a location using the map search first.');
            return;
        }
        if (!name.trim()) {
            alert('Please enter a venue name.');
            return;
        }
        try {
            await addVenueManually({
                name: name.trim(),
                address: address.trim() || `${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`,
                location: new GeoPoint(selectedLat, selectedLng),
                addedBy: user.uid,
                addedByCliqueId: currentClique.id,
            });
            onClose();
        }
        catch (err) {
            alert('Failed to add venue: ' + (err.message || 'Unknown error'));
        }
    };
    return (_jsx("div", { className: "uk-overlay", children: _jsxs("div", { className: "uk-modal", children: [_jsx("h2", { className: "uk-heading", style: { marginBottom: '0.25rem' }, children: "Add New Venue" }), _jsx("p", { style: { fontSize: '0.82rem', color: '#9B8FAD', marginTop: 0, marginBottom: '1.25rem' }, children: "Use the map search (top-left) to pin a location, then fill in the details below." }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.85rem' }, children: [_jsxs("div", { children: [_jsx("label", { className: "uk-label", children: "Venue name *" }), _jsx("input", { className: "uk-input", placeholder: "e.g. Mercury Lounge", value: name, onChange: e => setName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "uk-label", children: "Address" }), _jsx("input", { className: "uk-input", placeholder: "Auto-filled from map search", value: address, onChange: e => setAddress(e.target.value) })] }), _jsx("div", { style: {
                                background: '#2A1040',
                                border: `0.5px solid ${selectedLat ? 'rgba(232,184,109,0.35)' : 'rgba(155,143,173,0.2)'}`,
                                borderRadius: 'var(--uk-radius-sm)',
                                padding: '0.6rem 0.75rem',
                                fontSize: '0.82rem',
                                color: selectedLat ? '#E8B86D' : '#9B8FAD',
                            }, children: selectedLat && selectedLng
                                ? `📍 ${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`
                                : '📍 No location set — use map search' }), _jsxs("div", { style: { display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }, children: [_jsx("button", { className: "uk-btn uk-btn-primary", onClick: handleSubmit, disabled: loading || !selectedLat || !selectedLng || !name.trim(), style: { flex: 1 }, children: loading ? 'Saving...' : 'Add Venue' }), _jsx("button", { className: "uk-btn uk-btn-ghost", onClick: onClose, children: "Cancel" })] })] })] }) }));
}
