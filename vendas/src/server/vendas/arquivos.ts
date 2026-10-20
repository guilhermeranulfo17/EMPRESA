import 'server-only';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { decodificarTexto, LIMITE_BYTES_ARQUIVO, separarCsv } from '@/domain/vendas/csv';
import { ErroXlsx, lerXlsx } from './xlsx';

/*
 * Arquivos da importação: o que veio pelo upload ou o que está na pasta import/ (do app ou da
 * raiz do repositório). A pasta é ignorada pelo git: a lista tem telefones de pessoas reais e o
 * repositório é público. Na Vercel ela não existe; lá a importação é pelo upload.
 */

const PASTAS = [path.join(process.cwd(), 'import'), path.join(process.cwd(), '..', 'import')];
const EXTENSOES = /\.(csv|xlsx)$/i;

export type ArquivoPasta = { nome: string; bytes: number };

export async function listarPastaImport(): Promise<ArquivoPasta[]> {
  const vistos = new Map<string, ArquivoPasta>();
  for (const pasta of PASTAS) {
    const nomes = await readdir(pasta).catch(() => [] as string[]);
    for (const nome of nomes) {
      if (!EXTENSOES.test(nome) || vistos.has(nome)) continue;
      const s = await stat(path.join(pasta, nome)).catch(() => null);
      if (s?.isFile()) vistos.set(nome, { nome, bytes: s.size });
    }
  }
  return [...vistos.values()].sort((a, b) => a.nome.localeCompare(b.nome));
}

/** Lê um arquivo da pasta pelo nome (só os que a listagem mostra: nada de caminho). */
export async function lerDaPasta(nome: string): Promise<Uint8Array | null> {
  if (path.basename(nome) !== nome || !EXTENSOES.test(nome)) return null;
  for (const pasta of PASTAS) {
    const conteudo = await readFile(path.join(pasta, nome)).catch(() => null);
    if (conteudo) return conteudo;
  }
  return null;
}

export type Leitura = { ok: true; linhas: string[][] } | { ok: false; erro: string };

/** Linhas cruas de um CSV ou XLSX. */
export function lerLinhas(nome: string, bytes: Uint8Array): Leitura {
  if (bytes.byteLength === 0) return { ok: false, erro: 'O arquivo está vazio.' };
  if (bytes.byteLength > LIMITE_BYTES_ARQUIVO) {
    return { ok: false, erro: 'Arquivo grande demais (máximo de 4 MB). Divida a planilha.' };
  }
  const xlsx = /\.xlsx$/i.test(nome) || (bytes[0] === 0x50 && bytes[1] === 0x4b);
  if (xlsx) {
    try {
      return { ok: true, linhas: lerXlsx(bytes) };
    } catch (e) {
      return {
        ok: false,
        erro:
          e instanceof ErroXlsx ? e.message : 'Não consegui ler o XLSX. Salve de novo pelo Excel.',
      };
    }
  }
  if (/\.xls$/i.test(nome)) {
    return { ok: false, erro: 'Formato .xls antigo. Salve como .xlsx ou .csv.' };
  }
  return { ok: true, linhas: separarCsv(decodificarTexto(bytes)) };
}
