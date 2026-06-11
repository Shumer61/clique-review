import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Auth.tsx
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, logIn, loading, error } = useAuthStore();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin)
                await logIn(email, password);
            else
                await signUp(email, password);
        }
        catch { }
    };
    return (_jsx("div", { className: "uk-screen", style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }, children: _jsxs("div", { style: { width: '100%', maxWidth: '360px', padding: '1.5rem' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '2.5rem' }, children: [_jsx("div", { style: { fontSize: '2.5rem', marginBottom: '0.5rem' }, children: "\uD83C\uDF19" }), _jsx("h1", { style: { margin: 0, fontSize: '1.6rem', color: '#E8B86D', fontWeight: 600 }, children: "Clique Reviews" }), _jsx("p", { style: { margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#9B8FAD' }, children: "Nairobi nights, your crew's way" })] }), _jsx("div", { style: {
                        display: 'flex',
                        background: '#2A1040',
                        borderRadius: 'var(--uk-radius-md)',
                        padding: '3px',
                        marginBottom: '1.5rem',
                    }, children: ['Login', 'Sign Up'].map(tab => (_jsx("button", { onClick: () => setIsLogin(tab === 'Login'), className: "uk-btn", style: {
                            flex: 1,
                            background: (tab === 'Login') === isLogin ? '#E8B86D' : 'transparent',
                            color: (tab === 'Login') === isLogin ? '#1D0A2E' : '#9B8FAD',
                            border: 'none',
                            borderRadius: 'var(--uk-radius-sm)',
                            padding: '0.45rem',
                        }, children: tab }, tab))) }), _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '0.85rem' }, children: [_jsxs("div", { children: [_jsx("label", { className: "uk-label", children: "Email" }), _jsx("input", { type: "email", className: "uk-input", placeholder: "you@example.com", value: email, onChange: e => setEmail(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "uk-label", children: "Password" }), _jsx("input", { type: "password", className: "uk-input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: e => setPassword(e.target.value), required: true })] }), error && (_jsx("div", { style: {
                                background: 'rgba(226,75,74,0.12)',
                                border: '0.5px solid rgba(226,75,74,0.4)',
                                borderRadius: 'var(--uk-radius-sm)',
                                padding: '0.6rem 0.75rem',
                                fontSize: '0.82rem',
                                color: '#E24B4A',
                            }, children: error })), _jsx("button", { type: "submit", className: "uk-btn uk-btn-primary", disabled: loading, style: { marginTop: '0.25rem', padding: '0.7rem' }, children: loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account' })] })] }) }));
}
