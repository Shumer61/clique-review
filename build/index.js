import { jsx as _jsx } from "react/jsx-runtime";
// src/index.tsx (unchanged)
import { createRoot } from 'react-dom/client';
import App from './components/App';
import 'maplibre-gl/dist/maplibre-gl.css';
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(_jsx(App, {}));
}
