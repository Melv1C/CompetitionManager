import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Plugin to copy theme.css file to dist folder
const copyThemeCss = () => ({
  name: 'copy-theme-css',
  closeBundle() {
    const srcPath = path.resolve(__dirname, 'src/theme.css');
    const destPath = path.resolve(__dirname, 'dist/theme.css');
    copyFileSync(srcPath, destPath);
  },
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.stories.*', 'src/**/*.test.*'],
      tsconfigPath: './tsconfig.app.json',
      copyDtsFiles: false,
      bundledPackages: [],
    }),
    copyThemeCss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@repo/ui',
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@radix-ui\//,
        /^@hookform\//,
        /^@tiptap\//,
        /^prosemirror/,
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'cmdk',
        'date-fns',
        'embla-carousel-react',
        'input-otp',
        'lucide-react',
        'next-themes',
        'react-day-picker',
        /^react-hook-form/,
        'react-resizable-panels',
        'recharts',
        'sanitize-html',
        'sonner',
        'vaul',
        'zod',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
      ],
      output: {
        assetFileNames: 'index.css',
      },
    },
    cssCodeSplit: false,
  },
});
