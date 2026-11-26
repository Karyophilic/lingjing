import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 部署在 /lingjing/ 子路径；
  // Vercel / Cloudflare Pages 部署在根路径，可用 VITE_BASE 覆盖
  base: process.env.VITE_BASE || ((process.env.VERCEL || process.env.CF_PAGES) ? '/' : '/lingjing/'),
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
