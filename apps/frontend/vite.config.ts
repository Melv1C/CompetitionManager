import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3000'),
  VITE_PORT: z.coerce.number().default(5173),
});

export default defineConfig(({ mode }) => {
  const rawEnv = loadEnv(mode, process.cwd(), '');
  const env = envSchema.parse(rawEnv);

  return {
    plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: env.VITE_PORT,
      proxy: {
        '/api': env.VITE_API_URL,
      },
    },
  };
});
