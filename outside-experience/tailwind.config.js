/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // preto quente (não azulado) e papel cru: dão cara de impresso, não de template
        ink: { DEFAULT: "#0C0B0A", 2: "#151412", 3: "#211F1C", line: "#2E2B27" },
        paper: { DEFAULT: "#EEE9DF", 2: "#E3DCCD", line: "#CFC6B5" },
        brand: { DEFAULT: "#F26A1B", hover: "#FF7B2E", deep: "#B4470A" },
        // Outside School: folha de caderno
        folha: { DEFAULT: "#F6F2EA", 2: "#ECE6DA", pauta: "#DCD3C3" },
        muted: { DEFAULT: "#A39E95", dark: "#5E5850" },
      },
      fontFamily: {
        display: ["Anton", "Impact", "Arial Narrow", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ["Archivo", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      letterSpacing: { label: "0.08em" },
      maxWidth: { page: "84rem" },
    },
  },
  plugins: [],
};
