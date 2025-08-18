import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 5000
    },
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html')
      }
    }
  }
})
