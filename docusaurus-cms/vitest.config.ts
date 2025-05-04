import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/renderer/test/setup.ts'],
    alias: {
      '@': resolve(__dirname, './src/renderer/src')
    },
    include: ['./src/renderer/src/**/*.{test,spec}.{ts,tsx}']
  },
});