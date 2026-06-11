import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/VenueList.tsx
import { useEffect, useState } from 'react';
import { useVenueStore } from '../store/venueStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useAuthStore } from '../store/authStore';
import RatingModal from './RatingModal';
const sortOptions = [
    { value: 'rating_desc', label: 'Highest rated' },
    { value: 'latest_visit', label: 'Most recent visit' },
    { value: 'name_asc', label: 'Name A-Z' },
];
export default function VenueList({ onAddVenue }) {
    const { currentClique } = useCliqueStore();
    const { user } = useAuthStore();
    const { venues, sortBy, setSortBy, initLiveListeners, cleanup, deleteVenueById, loading } = useVenueStore();
    const [selectedVenueId, setSelectedVenueId] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    useEffect(() => {
        if (currentClique?.id)
            initLiveListeners(currentClique.id);
        return () => cleanup();
    }, [currentClique?.id]);
    if (!currentClique)
        return null;
    const handleRateClick = (venueId) => {
        setSelectedVenueId(venueId);
        setShowRatingModal(true);
    };
    const handleDeleteVenue = async (venueId, venueName) => {
        if (!confirm(`Delete "${venueName}"? This will also remove all its ratings and cannot be undone.`))
            return;
        await deleteVenueById(venueId);
    };
    return (_jsxs("div", { style: {
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: '100%',
            maxWidth: '400px',
            height: '50vh',
            background: 'white',
            boxShadow: '-2px -2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '1rem',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            pointerEvents: 'auto',
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }, children: [_jsx("h2", { style: { margin: 0, fontSize: '1.2rem' }, children: "Venues" }), _jsx("button", { onClick: onAddVenue, children: "+ Add Venue" })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { children: "Sort by: " }), _jsx("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), children: sortOptions.map(opt => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) })] }), venues.length === 0 && (_jsx("p", { style: { color: '#888', fontSize: '0.9rem' }, children: "No venues yet. Click \"+ Add Venue\" to add the first one." })), venues.map(venue => {
                const isOwner = user?.uid === venue.addedBy;
                return (_jsxs("div", { style: {
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginBottom: '0.75rem',
                    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsx("h3", { style: { margin: '0 0 0.25rem 0', fontSize: '1rem' }, children: venue.name }), isOwner && (_jsx("button", { onClick: () => handleDeleteVenue(venue.id, venue.name), disabled: loading, "aria-label": `Delete ${venue.name}`, style: {
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#c00',
                                        fontSize: '1rem',
                                        padding: '0 0.25rem',
                                        lineHeight: 1,
                                        flexShrink: 0,
                                    }, children: "\uD83D\uDDD1\uFE0F" }))] }), _jsx("div", { style: { fontSize: '0.8rem', color: '#666' }, children: venue.address }), _jsxs("div", { style: { marginTop: '0.5rem', fontSize: '0.9rem' }, children: [_jsx("strong", { children: "Avg rating:" }), ' ', venue.averageRating > 0 ? `${venue.averageRating.toFixed(1)} ★` : 'Not yet rated', ' ', "(", venue.ratingsCount, ")"] }), _jsx("button", { onClick: () => handleRateClick(venue.id), style: {
                                marginTop: '0.5rem',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }, children: "Log a visit" })] }, venue.id));
            }), showRatingModal && selectedVenueId && (_jsx(RatingModal, { venueId: selectedVenueId, onClose: () => { setShowRatingModal(false); setSelectedVenueId(null); } }))] }));
}
