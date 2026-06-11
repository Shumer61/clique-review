import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/PostStatusModal.tsx
import { useState } from 'react';
export default function PostStatusModal({ onClose, onPost, initialText = '' }) {
    const [text, setText] = useState(initialText);
    const maxLength = 100;
    const handleSubmit = () => {
        if (!text.trim())
            return;
        onPost(text.trim());
        onClose();
    };
    const suggestions = ['🔥 It\'s lit here!', '🚗 Long queue outside', '🍻 Cheap drinks tonight', '🎵 DJ is insane'];
    return (_jsx("div", { className: "uk-overlay", children: _jsxs("div", { className: "uk-modal", style: { maxWidth: '400px' }, children: [_jsx("h2", { className: "uk-heading", style: { marginBottom: '0.2rem' }, children: "Post a status" }), _jsx("p", { style: { fontSize: '0.8rem', color: '#9B8FAD', margin: '0 0 1.1rem' }, children: "Let your clique know what's happening right now" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }, children: suggestions.map(s => (_jsx("button", { onClick: () => setText(s), style: {
                            background: text === s ? 'rgba(232,184,109,0.15)' : 'rgba(155,143,173,0.1)',
                            border: `0.5px solid ${text === s ? 'rgba(232,184,109,0.4)' : 'rgba(155,143,173,0.2)'}`,
                            borderRadius: '20px',
                            color: text === s ? '#E8B86D' : '#9B8FAD',
                            fontSize: '0.75rem',
                            padding: '3px 10px',
                            cursor: 'pointer',
                        }, children: s }, s))) }), _jsx("textarea", { className: "uk-input", value: text, onChange: e => setText(e.target.value.slice(0, maxLength)), placeholder: "e.g. \uD83D\uDD25 It's absolutely packed, come through!", rows: 3, style: { marginBottom: '0.4rem' } }), _jsxs("div", { style: { fontSize: '0.75rem', textAlign: 'right', color: '#9B8FAD', marginBottom: '1rem' }, children: [text.length, "/", maxLength] }), _jsxs("div", { style: { display: 'flex', gap: '0.75rem' }, children: [_jsx("button", { className: "uk-btn uk-btn-primary", onClick: handleSubmit, disabled: !text.trim(), style: { flex: 1 }, children: "Post" }), _jsx("button", { className: "uk-btn uk-btn-ghost", onClick: onClose, children: "Cancel" })] })] }) }));
}
