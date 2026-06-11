// src/components/PostStatusModal.tsx
import { useState } from 'react';

interface PostStatusModalProps {
  onClose: () => void;
  onPost: (text: string) => void;
  initialText?: string;
}

export default function PostStatusModal({ onClose, onPost, initialText = '' }: PostStatusModalProps) {
  const [text, setText] = useState(initialText);
  const maxLength = 100;

  const handleSubmit = () => {
    if (!text.trim()) return;
    onPost(text.trim());
    onClose();
  };

  const suggestions = ['🔥 It\'s lit here!', '🚗 Long queue outside', '🍻 Cheap drinks tonight', '🎵 DJ is insane'];

  return (
    <div className="uk-overlay">
      <div className="uk-modal" style={{ maxWidth: '400px' }}>
        <h2 className="uk-heading" style={{ marginBottom: '0.2rem' }}>Post a status</h2>
        <p style={{ fontSize: '0.8rem', color: '#9B8FAD', margin: '0 0 1.1rem' }}>
          Let your clique know what's happening right now
        </p>

        {/* Quick suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => setText(s)}
              style={{
                background: text === s ? 'rgba(232,184,109,0.15)' : 'rgba(155,143,173,0.1)',
                border: `0.5px solid ${text === s ? 'rgba(232,184,109,0.4)' : 'rgba(155,143,173,0.2)'}`,
                borderRadius: '20px',
                color: text === s ? '#E8B86D' : '#9B8FAD',
                fontSize: '0.75rem',
                padding: '3px 10px',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <textarea
          className="uk-input"
          value={text}
          onChange={e => setText(e.target.value.slice(0, maxLength))}
          placeholder="e.g. 🔥 It's absolutely packed, come through!"
          rows={3}
          style={{ marginBottom: '0.4rem' }}
        />
        <div style={{ fontSize: '0.75rem', textAlign: 'right', color: '#9B8FAD', marginBottom: '1rem' }}>
          {text.length}/{maxLength}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="uk-btn uk-btn-primary"
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{ flex: 1 }}
          >
            Post
          </button>
          <button className="uk-btn uk-btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}