import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useCliqueStore } from '../store/cliqueStore';
import { listenToCliqueVenues, listenToCliqueRatings } from '../services/venues';
export default function Feed() {
    const { currentClique } = useCliqueStore();
    const [activities, setActivities] = useState([]);
    useEffect(() => {
        if (!currentClique?.id)
            return;
        // Listen to new venues – show latest 10
        const unsubVenues = listenToCliqueVenues(currentClique.id, (venues) => {
            const newVenueActivities = venues.slice(0, 10).map(v => ({
                id: v.id,
                type: 'venue_added',
                data: v,
                timestamp: v.createdAt,
            }));
            setActivities(prev => {
                const other = prev.filter(a => a.type !== 'venue_added');
                return [...newVenueActivities, ...other].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            });
        });
        // Listen to new ratings – show latest 10
        const unsubRatings = listenToCliqueRatings(currentClique.id, (ratings) => {
            const newRatingActivities = ratings.slice(0, 10).map(r => ({
                id: r.id,
                type: 'rating_added',
                data: r,
                timestamp: r.createdAt,
            }));
            setActivities(prev => {
                const other = prev.filter(a => a.type !== 'rating_added');
                return [...newRatingActivities, ...other].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            });
        });
        return () => {
            unsubVenues();
            unsubRatings();
        };
    }, [currentClique]);
    if (!currentClique)
        return null;
    const getVenueName = async (venueId) => {
        // For simplicity, we don't fetch venue name here. Could be added later.
        return "a venue";
    };
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '280px',
            height: '100vh',
            background: 'white',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '1rem',
            pointerEvents: 'auto'
        }, children: [_jsx("h2", { style: { fontSize: '1.2rem', marginTop: 0 }, children: "Recent Activity" }), activities.length === 0 && _jsx("p", { children: "No activity yet." }), activities.map(activity => (_jsxs("div", { style: {
                    borderBottom: '1px solid #eee',
                    padding: '0.75rem 0',
                    fontSize: '0.85rem'
                }, children: [activity.type === 'venue_added' && (_jsxs("div", { children: ["\uD83D\uDCCD New venue: ", _jsx("strong", { children: activity.data.name }), " added"] })), activity.type === 'rating_added' && (_jsxs("div", { children: ["\u2B50 ", _jsxs("strong", { children: [activity.data.rating, "\u2605"] }), " rating logged"] })), _jsx("div", { style: { fontSize: '0.7rem', color: '#888' }, children: new Date(activity.timestamp.seconds * 1000).toLocaleString() })] }, activity.id)))] }));
}
