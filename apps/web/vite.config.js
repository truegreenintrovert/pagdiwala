import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Keep environment configuration in the repository-root .env file.
  envDir: path.resolve(appDirectory, '../..'),
  plugins: [react()],
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(appDirectory, './src'),
    },
  },
});
