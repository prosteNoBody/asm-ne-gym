import { resolve } from 'path'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    basicSsl(),
  ],
  root: resolve(__dirname, 'demo'),
  build: {
    emptyOutDir: true,
    assetsDir: '',
    outDir: resolve(__dirname, 'build'),
    rollupOptions: {
      input: 'demo/index.html',
      plugins: [],
    },
  },
  server: {
    host: true,
    port: 9300,
    cors: true,
  },
  preview: {
    port: 9300,
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'core'),
      '@engine': resolve(__dirname, 'element-engine'),
      '@wasm': resolve(__dirname, 'wasm'),
      '@demo': resolve(__dirname, 'demo'),
      '@build_wasm': resolve(__dirname, 'build_wasm'),
    },
  },
})
