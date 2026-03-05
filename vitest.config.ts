import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.*',
        '**/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/setup.ts',
      ],
      // CI fails if coverage falls below these (same pattern as hello/ui)
      thresholds: {
        lines: 10,
        functions: 75,
        branches: 85,
        statements: 10,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});


