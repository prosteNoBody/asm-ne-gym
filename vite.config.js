import { resolve, normalize } from 'path'
import { readFileSync } from 'fs';
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    basicSsl(),
    vue(),
    // custom plugin to inject filename to modules [STATUS = currently not working because WebWorker build didn't replace palceholder value]
/*     {
      name: 'raw-filename-injector',
      enforce: 'post',
      transform(code, id) {
        if (!id.endsWith('.ts') || !code.includes("__FILENAME__")) return null;

        const fileName = id.split('/').pop().replace('.ts', '');
        const enhancedCode = code.replace(/__FILENAME__/g, `"${fileName}"`);

        return enhancedCode;
      }
    } */
  ],
  root: resolve(__dirname, 'demo'),
  base: './',
  build: {
    target: 'esnext',
    emptyOutDir: true,
    assetsDir: '',
    outDir: resolve(__dirname, 'build'),
    rollupOptions: {
      input: 'demo/index.html',
      plugins: [],
    },
  },
  worker: {
    format: 'es',
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
