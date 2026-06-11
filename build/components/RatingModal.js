import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/components/RatingModal.tsx
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { useCliqueStore } from '../store/cliqueStore';
import { useVenueStore } from '../store/venueStore';
const vibeTags = ['lively', 'chill', 'cheap drinks', 'good music', 'quiet', 'outdoor', 'crowded', 'romantic'];
function PastVisitRow({ ratingId, stars, tags, comment, dateStr, loading, onDelete, onSaveComment, }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(comment ?? '');
    const handleSave = () => {
        const trimmed = draft.trim();
        onSaveComment(ratingId, trimmed === '' ? undefined : trimmed);
        setEditing(false);
    };
    const handleCancel = () => {
        setDraft(comment ?? '');
        setEditing(false);
    };
    return (_jsxs("div", { style: {
            background: '#f9f9f9',
            borderRadius: '6px',
            padding: '0.6rem 0.75rem',
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsxs("span", { style: { fontWeight: 600 }, children: [stars, "\u2605"] }), tags.length > 0 && (_jsx("span", { style: { color: '#666', marginLeft: '0.5rem' }, children: tags.join(', ') })), _jsxs("span", { style: { color: '#999', marginLeft: '0.5rem' }, children: ["\u00B7 ", dateStr] })] }), _jsx("button", { onClick: () => onDelete(ratingId, dateStr), disabled: loading, "aria-label": "Delete this visit", style: { background: 'none', border: 'none', cursor: 'pointer', color: '#c00', fontSize: '1rem', flexShrink: 0 }, children: "\uD83D\uDDD1\uFE0F" })] }), editing ? (_jsxs("div", { style: { marginTop: '0.5rem' }, children: [_jsx("textarea", { value: draft, onChange: e => setDraft(e.target.value), rows: 2, autoFocus: true, style: { width: '100%', padding: '0.4rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' } }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }, children: [_jsx("button", { onClick: handleSave, disabled: loading, style: { background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }, children: "Save" }), _jsx("button", { onClick: handleCancel, style: { background: '#eee', border: 'none', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }, children: "Cancel" }), comment && (_jsx("button", { onClick: () => { onSaveComment(ratingId, undefined); setEditing(false); }, disabled: loading, style: { background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: '0.8rem', marginLeft: 'auto' }, children: "Remove comment" }))] })] })) : (_jsxs("div", { style: { marginTop: '0.35rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }, children: [comment ? (_jsxs("span", { style: { color: '#444', fontStyle: 'italic', flex: 1 }, children: ["\"", comment, "\""] })) : (_jsx("span", { style: { color: '#bbb', flex: 1 }, children: "No comment" })), _jsx("button", { onClick: () => setEditing(true), style: { background: 'none', border: 'none', cursor: 'pointer', color: '#007bff', fontSize: '0.8rem', flexShrink: 0, padding: 0 }, children: "\u270F\uFE0F" })] }))] }));
}
// ─── Main component ───────────────────────────────────────────────────────────
export default function RatingModal({ venueId, onClose }) {
    const { user } = useAuthStore();
    const { currentClique } = useCliqueStore();
    const { addRatingManually, deleteRatingById, updateRatingCommentById, ratings, loading } = useVenueStore();
    const [stars, setStars] = useState(3);
    const [selectedTags, setSelectedTags] = useState([]);
    const [comment, setComment] = useState('');
    const [visitedDate, setVisitedDate] = useState(new Date().toISOString().split('T')[0]);
    const myRatings = ratings.filter(r => r.venueId === venueId && r.userId === user?.uid);
    const handleTagToggle = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    const handleSubmit = async () => {
        if (!user || !currentClique?.id)
            return;
        await addRatingManually({
            venueId,
            cliqueId: currentClique.id,
            userId: user.uid,
            rating: stars,
            tags: selectedTags,
            comment: comment.trim() || undefined,
            visitedDate: Timestamp.fromDate(new Date(visitedDate)),
        });
        onClose();
    };
    const handleDeleteRating = async (ratingId, dateStr) => {
        if (!confirm(`Delete your visit logged on ${dateStr}? This cannot be undone.`))
            return;
        await deleteRatingById(ratingId);
    };
    const handleSaveComment = async (ratingId, newComment) => {
        await updateRatingCommentById(ratingId, newComment);
    };
    return (_jsx("div", { style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
        }, children: _jsxs("div", { style: {
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '85vh',
                overflowY: 'auto',
            }, children: [_jsx("h2", { style: { marginTop: 0 }, children: "Log your visit" }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '0.4rem', fontWeight: 600 }, children: "Rating (1\u20135 stars)" }), _jsx("div", { children: [1, 2, 3, 4, 5].map(s => (_jsxs("button", { onClick: () => setStars(s), style: {
                                    margin: '0 0.25rem',
                                    padding: '0.5rem',
                                    background: stars >= s ? '#ffc107' : '#eee',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }, children: [s, "\u2605"] }, s))) })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '0.4rem', fontWeight: 600 }, children: "Vibe tags" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }, children: vibeTags.map(tag => (_jsx("button", { onClick: () => handleTagToggle(tag), style: {
                                    padding: '0.25rem 0.75rem',
                                    background: selectedTags.includes(tag) ? '#007bff' : '#eee',
                                    color: selectedTags.includes(tag) ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                }, children: tag }, tag))) })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '0.4rem', fontWeight: 600 }, children: "Comment (optional)" }), _jsx("textarea", { value: comment, onChange: e => setComment(e.target.value), rows: 3, style: { width: '100%', padding: '0.5rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' } })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '0.4rem', fontWeight: 600 }, children: "Date visited" }), _jsx("input", { type: "date", value: visitedDate, onChange: e => setVisitedDate(e.target.value), style: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' } })] }), _jsxs("div", { style: { display: 'flex', gap: '1rem', marginBottom: myRatings.length > 0 ? '1.5rem' : 0 }, children: [_jsx("button", { onClick: handleSubmit, disabled: loading, style: { background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }, children: loading ? 'Saving...' : 'Submit Rating' }), _jsx("button", { onClick: onClose, style: { padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc' }, children: "Cancel" })] }), myRatings.length > 0 && (_jsxs("div", { style: { borderTop: '1px solid #eee', paddingTop: '1rem' }, children: [_jsx("h4", { style: { margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#555' }, children: "Your previous visits" }), myRatings.map(r => (_jsx(PastVisitRow, { ratingId: r.id, stars: r.rating, tags: r.tags, comment: r.comment, dateStr: r.visitedDate.toDate().toLocaleDateString(), loading: loading, onDelete: handleDeleteRating, onSaveComment: handleSaveComment }, r.id)))] }))] }) }));
}
