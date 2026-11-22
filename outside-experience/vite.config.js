import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build:arquivo` gera um único index.html (sem pastas) para ver o site em qualquer lugar.
export default defineConfig(({ mode }) => ({
  plugins: mode === "arquivo" ? [react(), viteSingleFile()] : [react()],
  build: mode === "arquivo" ? { outDir: "dist-arquivo" } : {},
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // Em desenvolvimento, /api vai para o servidor de inscrições (ver README).
  server: process.env.VITE_DEV_API_PROXY
    ? { proxy: { "/api": { target: process.env.VITE_DEV_API_PROXY, changeOrigin: true } } }
    : {},
}));
