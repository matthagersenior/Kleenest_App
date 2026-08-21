import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/Kleenest_App/',
  plugins: [
    react(),
    {
      name: 'github-pages-spa-fallback',
      closeBundle() {
        const dist = resolve(process.cwd(), 'dist');
        const index = resolve(dist, 'index.html');
        const fallback = resolve(dist, '404.html');
        if (!existsSync(index)) {
          throw new Error(`GitHub Pages SPA fallback: Vite did not emit ${index}`);
        }
        copyFileSync(index, fallback);
      }
    }
  ],
  build: { sourcemap: true }
});
