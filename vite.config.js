import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 4000, strictPort: true, proxy: { '/api': 'http://localhost:4001', '/ws': { target: 'ws://localhost:4001', ws: true } } },
});
