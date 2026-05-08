import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'src/client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'modelence/client': path.resolve(__dirname, './src/client/shims/modelence-client.ts'),
      '@modelence/react-query': path.resolve(
        __dirname,
        './src/client/shims/modelence-react-query.ts'
      )
    }
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true
  }
});
