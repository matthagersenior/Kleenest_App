import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/Kleenest_App/',
  plugins: [
    react(),
    {
      name: 'github-pages-spa-fallback',
      closeBundle() {
        const dist = resolve(process.cwd(), 'dist');
        copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
      }
    }
  ],
  build: { sourcemap: true }
});
