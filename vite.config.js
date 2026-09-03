
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    // NOTE: The /api/nvidia proxy was removed. The AI entry system now uses
    // a Vercel serverless function (api/nvidia.js) for auth.
    // For local dev, run: npx vercel dev  (instead of npm run dev)
    // which will handle /api/nvidia with the server-side NVIDIA_API_KEY.
  },
}));
