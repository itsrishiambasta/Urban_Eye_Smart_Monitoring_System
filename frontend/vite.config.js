import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://bracket-proposition-balance-updated.trycloudflare.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'ngrok-skip-browser-warning': '69420',
            'ngrok-skip-browser-warning-for-user': 'true',
            'User-Agent': 'UrbanEye-Frontend'
          }
        },
      },
      host: true
    },
  };
});
