import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/StatusPopup.tsx
// React overlay for status message bubbles — replaces maplibre HTML popups.
// Renders above the map at a fixed screen position. Supports owner-only deletion.
import { useAuthStore } from '../store/authStore';
import { useStatusStore } from '../store/statusStore';
export default function StatusPopup({ message, onClose }) {
    const { user } = useAuthStore();
    const { removeStatus } = useStatusStore();
    const isOwner = user?.uid === message.userId;
    const timeAgo = (() => {
        const seconds = Math.floor((Date.now() - message.createdAt.toDate().getTime()) / 1000);
        if (seconds < 60)
            return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60)
            return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    })();
    const expiresIn = (() => {
        const ms = message.expiresAt.toDate().getTime() - Date.now();
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        if (hours > 0)
            return `expires in ${hours}h ${minutes}m`;
        return `expires in ${minutes}m`;
    })();
    const handleDelete = async () => {
        if (!confirm('Delete this status? It will disappear for everyone in your clique.'))
            return;
        await removeStatus(message.id);
        onClose();
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { onClick: onClose, style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1500,
                } }), _jsxs("div", { style: {
                    position: 'fixed',
                    bottom: '180px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1600,
                    width: '90%',
                    maxWidth: '320px',
                    background: '#2E1245',
                    border: '0.5px solid rgba(232,184,109,0.25)',
                    borderRadius: '14px',
                    padding: '1rem 1.1rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    animation: 'uk-popup-in 0.18s ease-out',
                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, color: '#E8B86D', fontSize: '0.9rem' }, children: message.userId }), _jsxs("div", { style: { fontSize: '0.72rem', color: '#9B8FAD', marginTop: '0.1rem' }, children: [timeAgo, " \u00B7 ", expiresIn] })] }), _jsx("button", { onClick: onClose, style: {
                                    background: 'none',
                                    border: 'none',
                                    color: '#9B8FAD',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    lineHeight: 1,
                                    padding: '0 0 0 0.5rem',
                                }, "aria-label": "Close", children: "\u2715" })] }), _jsx("div", { style: {
                            color: '#F0EAD6',
                            fontSize: '0.95rem',
                            lineHeight: 1.5,
                            marginBottom: '0.85rem',
                            wordBreak: 'break-word',
                        }, children: message.text }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("div", { style: { fontSize: '0.72rem', color: '#9B8FAD' }, children: message.venueId ? '📍 At venue' : '📍 On the map' }), isOwner && (_jsx("button", { onClick: handleDelete, style: {
                                    background: 'rgba(226,75,74,0.12)',
                                    border: '0.5px solid rgba(226,75,74,0.3)',
                                    borderRadius: '6px',
                                    color: '#E24B4A',
                                    fontSize: '0.78rem',
                                    padding: '0.25rem 0.65rem',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDDD1\uFE0F Delete" }))] })] }), _jsx("style", { children: `
        @keyframes uk-popup-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      ` })] }));
}
