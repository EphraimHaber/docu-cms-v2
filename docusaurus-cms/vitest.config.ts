import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/renderer/test/setup.ts'],
    alias: [
      { find: '@', replacement: resolve(__dirname, './src/renderer/src') },
      {
        find: 'monaco-editor',
        replacement: resolve(__dirname, './node_modules/monaco-editor/esm/vs/editor/editor.api'),
      },
    ],
    include: ['./src/renderer/src/**/*.{test,spec}.{ts,tsx}'],
  },
});
