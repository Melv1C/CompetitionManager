import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom', 'react-hook-form', 'react-i18next', 'i18next'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        react: path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'react-hook-form': path.resolve(__dirname, './node_modules/react-hook-form'),
      },
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Core React - must load first
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react';
            }
            if (id.includes('node_modules/react-router')) {
              return 'router';
            }
            // Data fetching & state management
            if (
              id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/axios')
            ) {
              return 'data-layer';
            }
            // UI framework - Radix primitives
            if (id.includes('node_modules/@radix-ui')) {
              return 'ui-radix';
            }
            // Form handling
            if (
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')
            ) {
              return 'forms';
            }
            // Date utilities
            if (
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/react-day-picker')
            ) {
              return 'date-utils';
            }
            // Auth
            if (id.includes('node_modules/better-auth')) {
              return 'auth';
            }
            // Note: i18next/react-i18next NOT separated - they depend on React context
          },
        },
      },
    },
  };
});
