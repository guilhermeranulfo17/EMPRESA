/*
 * Campos do lead de prospecção e como ler cada um a partir do que vem da planilha ou do
 * formulário. Funções puras, usadas no navegador e no servidor.
 */

// ---------------------------------------------------------------------------
// segmento e prioridade
// ---------------------------------------------------------------------------

export const SEGMENTOS = ['buffet_infantil', 'buffet_catering', 'espaco_eventos', 'doces'] as const;
export type Segmento = (typeof SEGMENTOS)[number];

export const ROTULO_SEGMENTO: Record<Segmento, string> = {
  buffet_infantil: 'Buffet infantil',
  buffet_catering: 'Buffet / Catering',
  espaco_eventos: 'Espaço de eventos',
  doces: 'Doces',
};

export const PRIORIDADES = ['A', 'B', 'C'] as const;
export type Prioridade = (typeof PRIORIDADES)[number];

/** Sem acento, minúsculo, só letras, números e espaços simples. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** "Buffet infantil", "buffet / catering", "Espaço de Eventos", "Doceria"… → segmento. */
export function lerSegmento(texto: string | null | undefined): Segmento | null {
  const t = normalizarTexto(texto ?? '');
  if (!t) return null;
  if ((SEGMENTOS as readonly string[]).includes(t.replace(/ /g, '_')))
    return t.replace(/ /g, '_') as Segmento;
  if (/infantil|kids|crianca/.test(t)) return 'buffet_infantil';
  if (/doce|confeit|bolo|brigadeir/.test(t)) return 'doces';
  if (/espaco|salao|chacara|sitio|casa de (festa|evento)|eventos?$|local/.test(t))
    return 'espaco_eventos';
  if (/buffet|catering|bufe|gastronom|alimenta/.test(t)) return 'buffet_catering';
  return null;
}

export function lerPrioridade(texto: string | null | undefined): Prioridade | null {
  const t = (texto ?? '').trim().toUpperCase();
  const letra = t.match(/^(?:PRIORIDADE\s*)?([ABC])\b/)?.[1];
  return (letra as Prioridade | undefined) ?? null;
}

// ---------------------------------------------------------------------------
// cidade e UF
// ---------------------------------------------------------------------------

export const UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;

export function lerUf(texto: string | null | undefined): string | null {
  const t = (texto ?? '').trim().toUpperCase();
  return (UFS as readonly string[]).includes(t) ? t : null;
}

/** UF pelo DDD (para quando a planilha não traz o estado). */
const UF_POR_DDD: Record<string, string> = {};
for (const [uf, ddds] of Object.entries({
  SP: '11 12 13 14 15 16 17 18 19',
  RJ: '21 22 24',
  ES: '27 28',
  MG: '31 32 33 34 35 37 38',
  PR: '41 42 43 44 45 46',
  SC: '47 48 49',
  RS: '51 53 54 55',
  DF: '61',
  GO: '62 64',
  TO: '63',
  MT: '65 66',
  MS: '67',
  AC: '68',
  RO: '69',
  BA: '71 73 74 75 77',
  SE: '79',
  PE: '81 87',
  AL: '82',
  PB: '83',
  RN: '84',
  CE: '85 88',
  PI: '86 89',
  PA: '91 93 94',
  AM: '92 97',
  RR: '95',
  AP: '96',
  MA: '98 99',
})) {
  for (const d of ddds.split(' ')) UF_POR_DDD[d] = uf;
}

export function ufDoTelefone(digitos: string | null): string | null {
  return digitos ? (UF_POR_DDD[digitos.slice(0, 2)] ?? null) : null;
}

const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

/** Arruma só cidade toda em maiúsculas ou minúsculas: "SÃO JOSÉ DO RIO PRETO" → "São José do Rio Preto". */
function capitalizar(cidade: string): string {
  if (cidade !== cidade.toUpperCase() && cidade !== cidade.toLowerCase()) return cidade;
  return cidade
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
}

/** "Uberlândia - MG", "Uberlândia/MG", "Uberlândia, MG", "Uberlândia (MG)" → cidade e UF. */
export function separarCidadeUf(texto: string | null | undefined): {
  cidade: string | null;
  uf: string | null;
} {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return { cidade: null, uf: null };
  const m = t.match(/^(.*?)\s*(?:[-–/,]\s*|\()\s*([A-Za-z]{2})\)?$/);
  const uf = m ? lerUf(m[2]) : null;
  const cidade = (uf ? m![1]! : t).trim();
  return { cidade: cidade ? capitalizar(cidade).slice(0, 120) : null, uf };
}

/** Chave para agrupar a mesma cidade escrita de jeitos diferentes. */
export function chaveCidade(cidade: string | null, uf: string | null): string {
  return `${normalizarTexto(cidade ?? '')}|${uf ?? ''}`;
}

export function rotuloCidade(cidade: string | null, uf: string | null): string {
  if (!cidade) return uf ? `Sem cidade (${uf})` : 'Sem cidade';
  return uf ? `${cidade}/${uf}` : cidade;
}
