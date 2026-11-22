import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { viteSingleFile } from "vite-plugin-singlefile";

// O WhatsApp só mostra a imagem de prévia com o endereço completo do site (VITE_SITE_URL).
const enderecoDoSite = (siteUrl) => ({
  name: "endereco-do-site",
  transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl.replace(/\/$/, "")),
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "VITE_");
  const plugins = [react(), enderecoDoSite(env.VITE_SITE_URL || "")];
  // `npm run build:arquivo` gera um único index.html (sem pastas) para ver o site em qualquer lugar.
  if (mode === "arquivo") plugins.push(viteSingleFile());

  return {
    plugins,
    build: mode === "arquivo" ? { outDir: "dist-arquivo" } : {},
    resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
    // Em desenvolvimento, /api vai para o servidor de inscrições (ver README).
    server: process.env.VITE_DEV_API_PROXY
      ? { proxy: { "/api": { target: process.env.VITE_DEV_API_PROXY, changeOrigin: true } } }
      : {},
  };
});
