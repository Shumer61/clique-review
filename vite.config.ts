import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Vite outputs to 'dist' by default
  },
  server: {
    port: 3000,
  },
});