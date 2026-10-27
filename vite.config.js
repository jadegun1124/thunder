import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/thunder/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        preview: resolve(import.meta.dirname, 'preview/index.html'),
      },
    },
  },
})
