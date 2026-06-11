// src/components/StatusPopup.tsx
// React overlay for status message bubbles — replaces maplibre HTML popups.
// Renders above the map at a fixed screen position. Supports owner-only deletion.
import { useAuthStore } from '../store/authStore';
import { useStatusStore } from '../store/statusStore';
import { StatusMessage } from '../services/status';

interface StatusPopupProps {
  message: StatusMessage;
  onClose: () => void;
}

export default function StatusPopup({ message, onClose }: StatusPopupProps) {
  const { user } = useAuthStore();
  const { removeStatus } = useStatusStore();

  const isOwner = user?.uid === message.userId;

  const timeAgo = (() => {
    const seconds = Math.floor((Date.now() - message.createdAt.toDate().getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  })();

  const expiresIn = (() => {
    const ms = message.expiresAt.toDate().getTime() - Date.now();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `expires in ${hours}h ${minutes}m`;
    return `expires in ${minutes}m`;
  })();

  const handleDelete = async () => {
    if (!confirm('Delete this status? It will disappear for everyone in your clique.')) return;
    await removeStatus(message.id!);
    onClose();
  };

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1500,
        }}
      />

      {/* Popup card — centered on mobile, bottom-left on desktop */}
      <div
        style={{
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
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#E8B86D', fontSize: '0.9rem' }}>
              {message.userId}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9B8FAD', marginTop: '0.1rem' }}>
              {timeAgo} · {expiresIn}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9B8FAD',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              padding: '0 0 0 0.5rem',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Status text */}
        <div style={{
          color: '#F0EAD6',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          marginBottom: '0.85rem',
          wordBreak: 'break-word',
        }}>
          {message.text}
        </div>

        {/* Footer row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: '#9B8FAD' }}>
            {message.venueId ? '📍 At venue' : '📍 On the map'}
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              style={{
                background: 'rgba(226,75,74,0.12)',
                border: '0.5px solid rgba(226,75,74,0.3)',
                borderRadius: '6px',
                color: '#E24B4A',
                fontSize: '0.78rem',
                padding: '0.25rem 0.65rem',
                cursor: 'pointer',
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes uk-popup-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}