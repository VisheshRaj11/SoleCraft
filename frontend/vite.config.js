import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_DEPLOY_BACKEND,
          changeOrigin: true,
          secure: false,
        },
        '/brands': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});
