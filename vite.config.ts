/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: "./client",
  build: {
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./client", import.meta.url).href)
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
