import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Every request the browser makes to these paths gets forwarded to the
// Spring Boot backend on :7000. This is what lets the React app (on :5173)
// share the backend's session cookie as if they were the same origin —
// no CORS config, no SameSite=None headaches, during local dev.
const BACKEND = 'http://localhost:7000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/oauth2': { target: BACKEND, changeOrigin: true },
      '/login': { target: BACKEND, changeOrigin: true },
      '/logout': { target: BACKEND, changeOrigin: true }
    }
  }
});
