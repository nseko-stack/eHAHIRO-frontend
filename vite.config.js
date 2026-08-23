import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    codeSplit: true,
  },
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('react-router') || id.includes('@remix-run')) return 'router';
            if (id.includes('react') || id.includes('scheduler')) return 'vendor';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('axios') || id.includes('socket.io-client')) return 'network';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    global: 'globalThis',
  }
})
