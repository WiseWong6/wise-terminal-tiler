import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    {
      name: 'file-protocol-fix',
      transformIndexHtml(html, ctx) {
        if (ctx.server) return html;
        return html
          .replace(/ crossorigin/g, '');
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
