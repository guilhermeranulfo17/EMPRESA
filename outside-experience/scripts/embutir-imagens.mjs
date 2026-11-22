// Troca os caminhos das imagens de public/ por imagens embutidas no próprio index.html.
import { readFileSync, writeFileSync } from "node:fs";

const arquivo = "dist-arquivo/index.html";
let html = readFileSync(arquivo, "utf8");
const imagens = {
  "/outside-logo.png": ["public/outside-logo.png", "image/png"],
  "/img/hero.jpg": ["public/img/hero.jpg", "image/jpeg"],
  "/img/guilherme.jpg": ["public/img/guilherme.jpg", "image/jpeg"],
  "/img/marcos.jpg": ["public/img/marcos.jpg", "image/jpeg"],
  "/img/thiago.jpg": ["public/img/thiago.jpg", "image/jpeg"],
};
for (const [caminho, [origem, tipo]] of Object.entries(imagens)) {
  const dataUri = `data:${tipo};base64,${readFileSync(origem).toString("base64")}`;
  html = html.split(`"${caminho}"`).join(`"${dataUri}"`);
}
writeFileSync(arquivo, html);
console.log(`${arquivo}: ${(html.length / 1024 / 1024).toFixed(2)} MB`);
