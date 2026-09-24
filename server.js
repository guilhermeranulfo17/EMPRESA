// Servidor do escritório: roda o motor, guarda o histórico e transmite tudo ao navegador em tempo real (SSE).

import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Escritorio } from './public/js/engine.js';
import { CerebroSimulado } from './public/js/cerebro-simulado.js';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const pastaPublica = path.join(raiz, 'public');
const arquivoEstado = path.join(raiz, 'data', 'estado.json');
const PORTA = Number(process.env.PORT ?? 3000);

const config = JSON.parse(await readFile(path.join(pastaPublica, 'config', 'empresa.json'), 'utf8'));

// Usa Claude quando há credencial (ou OFFICE_BRAIN=claude); OFFICE_BRAIN=sim força a simulação.
const temCredencial = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const usarClaude = process.env.OFFICE_BRAIN === 'claude' || (temCredencial && process.env.OFFICE_BRAIN !== 'sim');
let cerebro;
if (usarClaude) {
  const { CerebroClaude } = await import('./src/cerebro-claude.js');
  cerebro = new CerebroClaude({ modelo: process.env.OFFICE_MODEL, esforco: process.env.OFFICE_EFFORT });
} else {
  cerebro = new CerebroSimulado();
}

const intervaloPadrao = usarClaude ? 8000 : 3500;
const escritorio = new Escritorio(config, cerebro, { intervaloBase: Number(process.env.OFFICE_INTERVALO ?? intervaloPadrao) });

try {
  escritorio.restaurar(JSON.parse(await readFile(arquivoEstado, 'utf8')));
  console.log('Histórico anterior carregado.');
} catch {
  // primeira execução: sem histórico
}

// ---------- tempo real ----------
const clientes = new Set();
escritorio.ouvir((tipo, dados) => {
  const pacote = `event: ${tipo}\ndata: ${JSON.stringify(dados)}\n\n`;
  for (const res of clientes) res.write(pacote);
});
setInterval(() => {
  for (const res of clientes) res.write(': ping\n\n');
}, 20000);

// ---------- persistência ----------
async function salvar() {
  const { mensagens, ideias, agentes } = escritorio.estado;
  await mkdir(path.dirname(arquivoEstado), { recursive: true });
  await writeFile(arquivoEstado, JSON.stringify({ mensagens, ideias, agentes }, null, 1));
}
setInterval(() => salvar().catch((e) => console.warn('Não salvou o estado:', e.message)), 15000);
for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, async () => {
    await salvar().catch(() => {});
    process.exit(0);
  });
}

// ---------- HTTP ----------
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    req.on('data', (parte) => {
      corpo += parte;
      if (corpo.length > 20000) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(corpo ? JSON.parse(corpo) : {});
      } catch (erro) {
        reject(erro);
      }
    });
    req.on('error', reject);
  });
}

function json(res, status, dados) {
  res.writeHead(status, { 'Content-Type': tipos['.json'] });
  res.end(JSON.stringify(dados));
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/stream') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(`event: foto\ndata: ${JSON.stringify(escritorio.foto())}\n\n`);
      clientes.add(res);
      req.on('close', () => clientes.delete(res));
      return;
    }
    if (url.pathname === '/api/estado' && req.method === 'GET') return json(res, 200, escritorio.foto());
    if (url.pathname === '/api/mensagem' && req.method === 'POST') {
      const mensagem = escritorio.postarDoCEO(await lerCorpo(req));
      return mensagem ? json(res, 201, mensagem) : json(res, 400, { erro: 'Escreva uma mensagem antes de enviar.' });
    }
    if (url.pathname === '/api/ideia' && req.method === 'POST') {
      const { id, decisao } = await lerCorpo(req);
      const ideia = escritorio.decidirIdeia(id, decisao);
      return ideia ? json(res, 200, ideia) : json(res, 400, { erro: 'Ideia não encontrada ou decisão inválida.' });
    }
    if (url.pathname === '/api/controle' && req.method === 'POST') {
      escritorio.definirControle(await lerCorpo(req));
      return json(res, 200, { pausado: escritorio.estado.pausado, velocidade: escritorio.estado.velocidade });
    }

    // arquivos estáticos
    const relativo = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const arquivo = path.normalize(path.join(pastaPublica, relativo));
    if (!arquivo.startsWith(pastaPublica)) return json(res, 403, { erro: 'Caminho inválido.' });
    const conteudo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': tipos[path.extname(arquivo)] ?? 'application/octet-stream' });
    res.end(conteudo);
  } catch (erro) {
    if (erro.code === 'ENOENT') return json(res, 404, { erro: 'Não encontrado.' });
    json(res, 500, { erro: erro.message });
  }
});

servidor.listen(PORTA, () => {
  escritorio.iniciar();
  const modo = usarClaude ? `Claude (${cerebro.modelo}, esforço ${cerebro.esforco})` : 'simulação (sem API)';
  console.log(`Escritório aberto em http://localhost:${PORTA} — cérebro: ${modo}`);
});
