import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [
    vue({ customElement: true }),
    vueJsx(),
    ...(command === 'serve' ? [vueDevTools()] : []),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'Shake',
      formats: ['iife'],
      fileName: () => 'shake.js',
    },
    cssCodeSplit: false,
    copyPublicDir: true,
  },
}))
