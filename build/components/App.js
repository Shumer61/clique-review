import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
export default function App() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    useEffect(() => {
        if (map.current)
            return;
        if (!mapContainer.current)
            return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
            center: [36.8219, -1.2921],
            zoom: 12
        });
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }, []);
    return (_jsxs("div", { style: { height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsx("header", { style: { padding: '1rem', background: '#333', color: 'white' }, children: _jsx("h1", { children: "Clique Reviews \u2013 Nairobi" }) }), _jsx("div", { ref: mapContainer, style: { flex: 1 } })] }));
}
