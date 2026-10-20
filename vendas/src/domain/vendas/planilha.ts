import {
  lerPrioridade,
  lerSegmento,
  lerUf,
  normalizarTexto,
  separarCidadeUf,
  ufDoTelefone,
  type Prioridade,
  type Segmento,
} from './campos';
import type { EtapaVendas } from './etapas';
import { montarTelefone } from './telefone';

/*
 * Importação da lista de prospecção (CSV ou XLSX já lidos em linhas). Função pura: o servidor
 * roda na prévia e de novo na hora de gravar. Colunas pelo nome, em qualquer ordem:
 * NOME DA EMPRESA, AVALIAÇÕES, CIDADE, NUMERO, CATEGORIA DE NEGOCIO, WHATSAPP, SEGMENTO,
 * PRIORIDADE, STATUS e ORIGEM (também aceita UF e OBSERVAÇÕES).
 * Telefone é a chave: repetido no arquivo, só a primeira linha vale.
 */

export const LIMITE_LINHAS = 3000;

type Coluna =
  | 'nome'
  | 'avaliacoes'
  | 'cidade'
  | 'uf'
  | 'telefone'
  | 'categoria'
  | 'whatsapp'
  | 'segmento'
  | 'prioridade'
  | 'status'
  | 'origem'
  | 'observacoes';

/** Nomes aceitos no cabeçalho (já normalizados: sem acento, minúsculos). */
const SINONIMOS: Record<Coluna, string[]> = {
  nome: ['nome da empresa', 'nome empresa', 'empresa', 'nome', 'nome fantasia', 'buffet'],
  avaliacoes: [
    'avaliacoes',
    'avaliacao',
    'avaliacoes google',
    'avaliacoes no google',
    'nota',
    'reviews',
  ],
  cidade: ['cidade', 'municipio', 'cidade uf'],
  uf: ['uf', 'estado'],
  telefone: ['numero', 'telefone', 'fone', 'celular', 'numero de telefone', 'tel'],
  categoria: ['categoria de negocio', 'categoria do negocio', 'categoria', 'tipo de negocio'],
  whatsapp: ['whatsapp', 'whats', 'wpp', 'zap', 'link whatsapp', 'link do whatsapp'],
  segmento: ['segmento'],
  prioridade: ['prioridade'],
  status: ['status', 'etapa', 'situacao'],
  origem: ['origem', 'fonte', 'canal'],
  observacoes: ['observacoes', 'observacao', 'obs', 'notas'],
};

function colunaDoCabecalho(titulo: string): Coluna | null {
  const t = normalizarTexto(titulo);
  for (const [coluna, nomes] of Object.entries(SINONIMOS) as [Coluna, string[]][]) {
    if (nomes.includes(t)) return coluna;
  }
  return null;
}

/** STATUS da planilha → etapa. Vazio é "Não contatado". */
export function lerStatus(texto: string): EtapaVendas | null {
  const t = normalizarTexto(texto);
  if (!t || /nao contat|novo|a contatar|pendente/.test(t)) return 'nao_contatado';
  if (/sem interesse|nao tem interesse|perdid|recus|desist|nao quer/.test(t))
    return 'sem_interesse';
  if (/fech|cliente|assin|ganh/.test(t)) return 'fechou';
  if (/teste/.test(t)) return 'em_teste';
  if (/respond/.test(t)) return 'respondeu';
  if (/follow|cobr|lembr/.test(t)) return 'followup';
  if (/mensagem|msg|enviad|abordad|contatad/.test(t)) return 'mensagem_1';
  return null;
}

export type DadosImportados = {
  nome: string;
  cidade: string | null;
  uf: string | null;
  telefone: string;
  telefoneDigitos: string;
  whatsapp: string | null;
  categoria: string | null;
  segmento: Segmento | null;
  prioridade: Prioridade | null;
  avaliacoes: string | null;
  origem: string | null;
  etapa: EtapaVendas;
  observacoes: string | null;
};

export type LinhaImportacao = {
  /** Número da linha na planilha (1 = primeira linha do arquivo). */
  linha: number;
  situacao: 'ok' | 'invalida' | 'repetida';
  nome: string;
  dados: DadosImportados | null;
  erro: string | null;
  avisos: string[];
};

export type LeituraPlanilha =
  { ok: true; colunas: Coluna[]; linhas: LinhaImportacao[] } | { ok: false; erro: string };

const corta = (v: string, max: number) => (v.trim() ? v.trim().slice(0, max) : null);

/** "4.8" (número do Excel) → "4,8". */
function lerAvaliacoes(v: string): string | null {
  const t = v.trim();
  return corta(/^\d+\.\d+$/.test(t) ? t.replace('.', ',') : t, 40);
}

export function lerPlanilha(linhasCruas: string[][]): LeituraPlanilha {
  // o cabeçalho é a primeira linha (até a 10ª) que tem o nome e o telefone
  let inicio = -1;
  let mapa: (Coluna | null)[] = [];
  for (let i = 0; i < Math.min(10, linhasCruas.length); i++) {
    const m = linhasCruas[i]!.map(colunaDoCabecalho);
    if (m.includes('nome') && (m.includes('telefone') || m.includes('whatsapp'))) {
      inicio = i;
      mapa = m;
      break;
    }
  }
  if (inicio < 0) {
    return {
      ok: false,
      erro: 'Não achei as colunas NOME DA EMPRESA e NUMERO (ou WHATSAPP). A primeira linha precisa ter os nomes das colunas.',
    };
  }
  const dados = linhasCruas.slice(inicio + 1).filter((l) => l.some((v) => v.trim() !== ''));
  if (dados.length === 0) return { ok: false, erro: 'A planilha não tem nenhuma linha de lead.' };
  if (dados.length > LIMITE_LINHAS) {
    return { ok: false, erro: `Planilha com mais de ${LIMITE_LINHAS} linhas. Divida em partes.` };
  }

  const vistos = new Set<string>();
  let numero = inicio + 1;
  const linhas = linhasCruas.slice(inicio + 1).flatMap((valores): LinhaImportacao[] => {
    numero++;
    if (!valores.some((v) => v.trim() !== '')) return [];
    const bruto = {} as Record<Coluna, string>;
    mapa.forEach((coluna, j) => {
      if (coluna && !bruto[coluna]) bruto[coluna] = String(valores[j] ?? '').trim();
    });
    const v = (c: Coluna) => bruto[c] ?? '';
    const nome = v('nome').replace(/\s+/g, ' ');
    const base = { linha: numero, nome, avisos: [] as string[] };
    if (nome.length < 2) {
      return [{ ...base, situacao: 'invalida', dados: null, erro: 'Sem nome da empresa.' }];
    }
    if (nome.length > 120) {
      return [{ ...base, situacao: 'invalida', dados: null, erro: 'Nome com mais de 120 letras.' }];
    }
    const tel = montarTelefone(v('telefone'), v('whatsapp'));
    if (!tel) {
      return [
        {
          ...base,
          situacao: 'invalida',
          dados: null,
          erro: v('telefone') || v('whatsapp') ? 'Telefone inválido.' : 'Sem telefone.',
        },
      ];
    }
    const lugar = separarCidadeUf(v('cidade'));
    const uf = lerUf(v('uf')) ?? lugar.uf ?? ufDoTelefone(tel.digitos);
    const segmento = lerSegmento(v('segmento')) ?? lerSegmento(v('categoria'));
    if (v('segmento') && !lerSegmento(v('segmento'))) {
      base.avisos.push(`Segmento "${v('segmento')}" não reconhecido.`);
    }
    const prioridade = lerPrioridade(v('prioridade'));
    if (v('prioridade') && !prioridade) {
      base.avisos.push(`Prioridade "${v('prioridade')}" não reconhecida.`);
    }
    let etapa = lerStatus(v('status'));
    if (!etapa) {
      base.avisos.push(`Status "${v('status')}" não reconhecido: entra como Não contatado.`);
      etapa = 'nao_contatado';
    }
    const repetida = vistos.has(tel.digitos);
    vistos.add(tel.digitos);
    return [
      {
        ...base,
        situacao: repetida ? 'repetida' : 'ok',
        erro: null,
        dados: {
          nome,
          cidade: lugar.cidade,
          uf,
          telefone: tel.telefone,
          telefoneDigitos: tel.digitos,
          whatsapp: tel.whatsapp,
          categoria: corta(v('categoria'), 120),
          segmento,
          prioridade,
          avaliacoes: lerAvaliacoes(v('avaliacoes')),
          origem: corta(v('origem'), 80),
          etapa,
          observacoes: corta(v('observacoes'), 4000),
        },
      },
    ];
  });
  return { ok: true, colunas: mapa.filter((c): c is Coluna => c !== null), linhas };
}
