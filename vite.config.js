import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The backend's default CLIENT_URL is http://localhost:5173, so the dev server must stay on that port.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
});
