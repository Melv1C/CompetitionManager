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
      dedupe: ['react', 'react-dom', 'react-hook-form'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        react: path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'react-hook-form': path.resolve(__dirname, './node_modules/react-hook-form'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom')) {
                return 'react-dom';
              }
              if (id.includes('/react/')) {
                return 'react';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'tanstack-query';
              }
              if (id.includes('react-router')) {
                return 'react-router';
              }
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'react-hook-form';
              }
              if (id.includes('zod')) {
                return 'zod';
              }
              if (id.includes('i18next')) {
                return 'i18next';
              }
              if (id.includes('lucide-react')) {
                return 'lucide';
              }
              if (id.includes('date-fns')) {
                return 'date-fns';
              }
              if (id.includes('@radix-ui')) {
                return 'radix-ui';
              }
              if (id.includes('socket.io')) {
                return 'socket-io';
              }
              if (id.includes('@prisma/studio')) {
                return 'prisma-studio';
              }
              if (id.includes('better-auth')) {
                return 'better-auth';
              }
            }
          },
        },
      },
    },
  };
});
