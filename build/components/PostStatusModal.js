import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
                maxWidth: '400px'
            }, children: [_jsx("h2", { children: "Post a status update" }), _jsx("textarea", { value: text, onChange: (e) => setText(e.target.value.slice(0, maxLength)), placeholder: "e.g., \uD83D\uDD25 It's lit here, come join!", rows: 3, style: { width: '100%', padding: '0.5rem', boxSizing: 'border-box', marginBottom: '0.5rem' } }), _jsxs("div", { style: { fontSize: '0.8rem', textAlign: 'right', marginBottom: '1rem' }, children: [text.length, "/", maxLength] }), _jsxs("div", { style: { display: 'flex', gap: '1rem' }, children: [_jsx("button", { onClick: handleSubmit, disabled: !text.trim(), children: "Post" }), _jsx("button", { onClick: onClose, children: "Cancel" })] })] }) }));
}
