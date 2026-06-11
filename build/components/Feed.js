import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Feed.tsx
import { useEffect, useState } from 'react';
import { useCliqueStore } from '../store/cliqueStore';
import { listenToCliqueVenues, listenToCliqueRatings } from '../services/venues';
export default function Feed() {
    const { currentClique } = useCliqueStore();
    const [activities, setActivities] = useState([]);
    useEffect(() => {
        if (!currentClique?.id)
            return;
        const unsubVenues = listenToCliqueVenues(currentClique.id, (venues) => {
            const items = venues.slice(0, 10).map(v => ({
                id: `venue-${v.id}`,
                type: 'venue_added',
                data: v,
                timestamp: v.createdAt,
            }));
            setActivities(prev => {
                const other = prev.filter(a => a.type !== 'venue_added');
                return [...items, ...other].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            });
        });
        const unsubRatings = listenToCliqueRatings(currentClique.id, (ratings) => {
            const items = ratings.slice(0, 10).map(r => ({
                id: `rating-${r.id}`,
                type: 'rating_added',
                data: r,
                timestamp: r.createdAt,
            }));
            setActivities(prev => {
                const other = prev.filter(a => a.type !== 'rating_added');
                return [...items, ...other].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            });
        });
        return () => { unsubVenues(); unsubRatings(); };
    }, [currentClique?.id]);
    if (!currentClique)
        return null;
    return (_jsxs("div", { className: "uk-scroll", style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '270px',
            height: '100%',
            background: 'rgba(29,10,46,0.93)',
            backdropFilter: 'blur(8px)',
            borderRight: '0.5px solid rgba(232,184,109,0.12)',
            zIndex: 900,
            overflowY: 'auto',
            padding: '1rem',
        }, children: [_jsx("h2", { style: { color: '#E8B86D', fontSize: '0.8rem', letterSpacing: '0.08em', margin: '0 0 1rem' }, children: "RECENT ACTIVITY" }), activities.length === 0 && (_jsx("p", { style: { color: '#9B8FAD', fontSize: '0.82rem' }, children: "No activity yet." })), activities.map(activity => {
                const time = new Date(activity.timestamp.seconds * 1000).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit',
                });
                const date = new Date(activity.timestamp.seconds * 1000).toLocaleDateString([], {
                    month: 'short', day: 'numeric',
                });
                return (_jsxs("div", { style: {
                        borderBottom: '0.5px solid rgba(232,184,109,0.08)',
                        padding: '0.7rem 0',
                        fontSize: '0.83rem',
                    }, children: [activity.type === 'venue_added' ? (_jsxs("div", { children: [_jsx("span", { style: { marginRight: '0.4rem' }, children: "\uD83D\uDCCD" }), _jsx("span", { style: { color: '#9B8FAD' }, children: "New venue: " }), _jsx("span", { style: { color: '#E8B86D', fontWeight: 500 }, children: activity.data.name })] })) : (_jsxs("div", { children: [_jsx("span", { style: { marginRight: '0.4rem' }, children: "\u2B50" }), _jsxs("span", { style: { color: '#E8B86D', fontWeight: 500 }, children: [activity.data.rating, "\u2605"] }), _jsx("span", { style: { color: '#9B8FAD' }, children: " visit logged" }), activity.data.comment && (_jsxs("div", { style: {
                                        marginTop: '0.25rem',
                                        color: '#F0EAD6',
                                        fontStyle: 'italic',
                                        fontSize: '0.78rem',
                                        paddingLeft: '1.4rem',
                                    }, children: ["\"", activity.data.comment, "\""] }))] })), _jsxs("div", { style: { fontSize: '0.72rem', color: '#9B8FAD', marginTop: '0.3rem', paddingLeft: '1.4rem' }, children: [date, " \u00B7 ", time] })] }, activity.id));
            })] }));
}
