import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // This is what Vercel expects as the output folder
  },
  server: {
    port: 5173, // Optional: for local dev only
  },
});
