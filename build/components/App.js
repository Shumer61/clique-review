import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import Auth from './Auth';
import AuthenticatedApp from './AuthenticatedApp';
import 'maplibre-gl/dist/maplibre-gl.css';
export default function App() {
    const { user, loading, initAuthListener } = useAuthStore();
    useEffect(() => {
        const unsubscribe = initAuthListener();
        return () => unsubscribe();
    }, [initAuthListener]);
    if (loading) {
        return _jsx("div", { style: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: "Loading..." });
    }
    if (!user) {
        return _jsx(Auth, {});
    }
    return _jsx(AuthenticatedApp, {});
}
