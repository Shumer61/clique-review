import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        if (!user || !currentClique) {
            alert('Missing user or clique. Please log out and back in.');
            return;
        }
        if (!selectedLat || !selectedLng) {
            alert('Please select a location using the map search or "Use my location" button.');
            return;
        }
        if (!name.trim()) {
            alert('Please enter a venue name.');
            return;
        }
        const venueData = {
            name: name.trim(),
            address: address.trim() || `${selectedLat}, ${selectedLng}`,
            location: new GeoPoint(selectedLat, selectedLng),
            addedBy: user.uid,
            addedByCliqueId: currentClique.id,
        };
        try {
            await addVenueManually(venueData);
            onClose();
        }
        catch (err) {
            alert('Failed to add venue: ' + (err.message || 'Unknown error'));
        }
    };
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }, children: _jsxs("div", { style: {
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '90%',
                maxWidth: '500px'
            }, children: [_jsx("h2", { children: "Add New Venue" }), _jsxs("p", { style: { fontSize: '0.9rem', color: '#555' }, children: ["Use the map search (top\u2011left) or click ", _jsx("strong", { children: "\uD83D\uDCCD Use my location" }), " to set coordinates."] }), _jsx("div", { style: { marginBottom: '1rem' }, children: _jsx("input", { type: "text", placeholder: "Venue name *", value: name, onChange: (e) => setName(e.target.value), style: { width: '100%', padding: '0.5rem', boxSizing: 'border-box' } }) }), _jsx("div", { style: { marginBottom: '1rem' }, children: _jsx("input", { type: "text", placeholder: "Address (optional, auto\u2011filled from search)", value: address, onChange: (e) => setAddress(e.target.value), style: { width: '100%', padding: '0.5rem', boxSizing: 'border-box' } }) }), _jsxs("div", { style: { marginBottom: '1rem', background: '#f0f0f0', padding: '0.5rem', borderRadius: '4px' }, children: [_jsx("strong", { children: "Selected location:" }), _jsx("br", {}), selectedLat && selectedLng ? (_jsxs("span", { children: ["Lat ", selectedLat.toFixed(5), ", Lng ", selectedLng.toFixed(5)] })) : (_jsx("span", { style: { color: '#999' }, children: "Not set \u2013 use map search or location button" }))] }), _jsxs("div", { style: { display: 'flex', gap: '1rem' }, children: [_jsx("button", { onClick: handleSubmit, disabled: loading || !selectedLat || !selectedLng, children: loading ? 'Saving...' : 'Add Venue' }), _jsx("button", { onClick: onClose, children: "Cancel" })] })] }) }));
}
