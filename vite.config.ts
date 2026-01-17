import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        logger: resolve(__dirname, 'src/utils/logger.ts'),
        'utils/auth-events': resolve(__dirname, 'src/utils/auth-events.ts'),
      },
      name: 'ReactCommon',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'logger') {
          return `logger.${format === 'es' ? 'esm' : format}.js`;
        }
        if (entryName === 'utils/auth-events') {
          return `utils/auth-events.${format === 'es' ? 'esm' : format}.js`;
        }
        return `index.${format === 'es' ? 'esm' : format}.js`;
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@auth0/auth0-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React',
        },
        assetFileNames: (assetInfo) => {
          // Rename CSS file to match package name
          if (assetInfo.name === 'style.css') {
            return 'common-react.css';
          }
          return assetInfo.name || 'assets/[name][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
