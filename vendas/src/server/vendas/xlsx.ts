import { inflateRawSync } from 'node:zlib';

/*
 * Leitor mínimo de XLSX, sem dependência: abre o ZIP com o zlib do Node e lê a primeira aba
 * (textos compartilhados, textos inline, números e booleanos). Fórmulas valem pelo último valor
 * salvo. Serve para a planilha da prospecção, não para qualquer Excel.
 */

export class ErroXlsx extends Error {}

type Entrada = { metodo: number; tamanho: number; inicio: number };

function lerZip(bytes: Buffer): Map<string, Entrada> {
  // fim do diretório central: assinatura 0x06054b50 nos últimos 64 KB
  let fim = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50) {
      fim = i;
      break;
    }
  }
  if (fim < 0) throw new ErroXlsx('O arquivo não é um XLSX válido.');
  const total = bytes.readUInt16LE(fim + 10);
  let p = bytes.readUInt32LE(fim + 16);
  const entradas = new Map<string, Entrada>();
  for (let n = 0; n < total; n++) {
    if (bytes.readUInt32LE(p) !== 0x02014b50) throw new ErroXlsx('O arquivo XLSX está corrompido.');
    const metodo = bytes.readUInt16LE(p + 10);
    const tamanho = bytes.readUInt32LE(p + 20);
    const nomeLen = bytes.readUInt16LE(p + 28);
    const extraLen = bytes.readUInt16LE(p + 30);
    const comentarioLen = bytes.readUInt16LE(p + 32);
    const local = bytes.readUInt32LE(p + 42);
    const nome = bytes.toString('utf8', p + 46, p + 46 + nomeLen);
    const inicio = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
    entradas.set(nome, { metodo, tamanho, inicio });
    p += 46 + nomeLen + extraLen + comentarioLen;
  }
  return entradas;
}

function arquivo(bytes: Buffer, entradas: Map<string, Entrada>, nome: string): string | null {
  const e = entradas.get(nome);
  if (!e) return null;
  const dados = bytes.subarray(e.inicio, e.inicio + e.tamanho);
  if (e.metodo === 0) return dados.toString('utf8');
  if (e.metodo === 8) return inflateRawSync(dados).toString('utf8');
  throw new ErroXlsx('Compressão do XLSX não suportada.');
}

function decodificar(texto: string): string {
  return texto
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/_x([0-9A-F]{4})_/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)));
}

/** Todo o texto dos <t> de um trecho (texto simples ou com formatação). */
function textos(xml: string): string {
  return [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)]
    .map((m) => decodificar(m[1]!))
    .join('');
}

const atributo = (attrs: string, nome: string) =>
  attrs.match(new RegExp(`\\b${nome}="([^"]*)"`))?.[1] ?? null;

/** "C12" → 2 (coluna zero-based). */
function indiceColuna(ref: string): number {
  const letras = ref.match(/^[A-Z]+/)?.[0] ?? 'A';
  let n = 0;
  for (const l of letras) n = n * 26 + (l.charCodeAt(0) - 64);
  return n - 1;
}

/** Número do Excel como texto: inteiros grandes (telefone) sem notação científica. */
function numero(v: string): string {
  if (!/e/i.test(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n.toFixed(0) : v;
}

/** Linhas da primeira aba do XLSX, como texto. */
export function lerXlsx(conteudo: Uint8Array): string[][] {
  const bytes = Buffer.from(conteudo);
  const entradas = lerZip(bytes);

  let caminho = 'xl/worksheets/sheet1.xml';
  const workbook = arquivo(bytes, entradas, 'xl/workbook.xml');
  const rels = arquivo(bytes, entradas, 'xl/_rels/workbook.xml.rels');
  const primeira = workbook?.match(/<sheet\b[^>]*>/)?.[0];
  const rid = primeira && (atributo(primeira, 'r:id') ?? atributo(primeira, 'id'));
  if (rid && rels) {
    const rel = [...rels.matchAll(/<Relationship\b[^>]*>/g)]
      .map((m) => m[0])
      .find((r) => atributo(r, 'Id') === rid);
    const alvo = rel && atributo(rel, 'Target');
    if (alvo) caminho = alvo.startsWith('/') ? alvo.slice(1) : `xl/${alvo.replace(/^\.\//, '')}`;
  }
  const planilha = arquivo(bytes, entradas, caminho);
  if (!planilha) throw new ErroXlsx('Não achei a primeira aba da planilha.');

  const compartilhados = [
    ...(arquivo(bytes, entradas, 'xl/sharedStrings.xml') ?? '').matchAll(/<si>([\s\S]*?)<\/si>/g),
  ].map((m) => textos(m[1]!));

  const linhas: string[][] = [];
  for (const r of planilha.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const indice = Number(atributo(r[1]!, 'r') ?? linhas.length + 1) - 1;
    const celulas: string[] = [];
    for (const c of (r[2] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1]!;
      const corpo = c[2] ?? '';
      const ref = atributo(attrs, 'r');
      const col = ref ? indiceColuna(ref) : celulas.length;
      const tipo = atributo(attrs, 't');
      const v = corpo.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let valor = '';
      if (tipo === 's') valor = compartilhados[Number(v)] ?? '';
      else if (tipo === 'inlineStr') valor = textos(corpo);
      else if (tipo === 'b') valor = v === '1' ? 'VERDADEIRO' : 'FALSO';
      else if (tipo === 'str' || tipo === 'e') valor = v ? decodificar(v) : '';
      else if (v !== undefined) valor = numero(v);
      while (celulas.length < col) celulas.push('');
      celulas[col] = valor;
    }
    while (linhas.length < indice) linhas.push([]);
    linhas[indice] = celulas;
  }
  return linhas;
}
