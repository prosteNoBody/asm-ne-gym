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
    outDir: resolve(__dirname, 'build'),
    rollupOptions: {
      assetsDir: '',
      input: 'demo/index.html',
      plugins: [],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 9300,
    cors: true,
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'core'),
      '@engine': resolve(__dirname, 'element-engine'),
      '@wasm': resolve(__dirname, 'wasm'),
      '@demo': resolve(__dirname, 'demo'),
    },
  },
})
