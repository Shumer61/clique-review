import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/App.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import Auth from './Auth';
import AuthenticatedApp from './AuthenticatedApp';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../usiku.css';
export default function App() {
    const { user, loading, initAuthListener } = useAuthStore();
    useEffect(() => {
        const unsubscribe = initAuthListener();
        return () => unsubscribe();
    }, [initAuthListener]);
    if (loading) {
        return (_jsxs("div", { style: {
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1D0A2E',
                color: '#E8B86D',
                gap: '1rem',
            }, children: [_jsx("div", { style: { fontSize: '2rem' }, children: "\uD83C\uDF19" }), _jsx("div", { style: { fontSize: '0.9rem', color: '#9B8FAD', letterSpacing: '0.1em' }, children: "LOADING..." })] }));
    }
    if (!user)
        return _jsx(Auth, {});
    return _jsx(AuthenticatedApp, {});
}
