import { defineConfig } from 'vite';
const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Klang',
      fileName: 'klang'
    },
    target: 'es2015',
    minify: 'terser',
    
  },
    development: {
      "host": "0.0.0.0",
    },
    optimizeDeps: {
      exclude: ['@plan8/klang'],
    },
    plugins: [
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            next();
          });
        },
      },
    ],
  });

