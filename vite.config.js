import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://m3-lab2-api.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
});