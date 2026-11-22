import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // Em desenvolvimento, /api vai para o servidor de inscrições (ver README).
  server: process.env.VITE_DEV_API_PROXY
    ? { proxy: { "/api": { target: process.env.VITE_DEV_API_PROXY, changeOrigin: true } } }
    : {},
});
