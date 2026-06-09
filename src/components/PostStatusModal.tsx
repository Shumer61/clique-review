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

  return (
    <div style={{
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
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '400px'
      }}>
        <h2>Post a status update</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          placeholder="e.g., 🔥 It's lit here, come join!"
          rows={3}
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', marginBottom: '0.5rem' }}
        />
        <div style={{ fontSize: '0.8rem', textAlign: 'right', marginBottom: '1rem' }}>
          {text.length}/{maxLength}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSubmit} disabled={!text.trim()}>Post</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}