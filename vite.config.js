import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Relative assets so the built site works on GitHub project pages
  // (https://<user>.github.io/portfolio/) and on a user site.
  base: command === 'build' ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
}));
