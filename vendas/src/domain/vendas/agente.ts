import { z } from 'zod';
import { ETAPAS_VENDAS } from './etapas';

/*
 * Saída do copiloto de vendas. O provedor de IA recebe o JSON Schema abaixo e a resposta é
 * validada de novo aqui com Zod (os dois provedores, Gemini e Claude, passam pela mesma
 * validação). Resposta inválida nunca é gravada: vira um erro amigável.
 */

export const ANGULOS = [
  'abertura',
  'resposta',
  'lembrete',
  'valor_novo',
  'prova_social',
  'ultima_chamada',
] as const;
export type Angulo = (typeof ANGULOS)[number];

export const ROTULO_ANGULO: Record<Angulo, string> = {
  abertura: 'Abertura',
  resposta: 'Resposta',
  lembrete: 'Lembrete',
  valor_novo: 'Valor novo',
  prova_social: 'Prova social',
  ultima_chamada: 'Última chamada',
};

export const saidaAgenteSchema = z.object({
  diagnostico: z.string().trim().min(1).max(2000),
  mensagem: z.string().trim().max(4000),
  etapa: z.enum(ETAPAS_VENDAS),
  resumo: z.string().trim().max(2000),
  proximo_followup: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
  angulo: z.enum(ANGULOS),
  passar_para_humano: z.boolean(),
  nao_contatar: z.boolean(),
  motivo: z.string().trim().max(500),
});
export type SaidaAgente = z.infer<typeof saidaAgenteSchema>;

/** O mesmo formato em JSON Schema, para o provedor gerar a resposta já no formato. */
export const SCHEMA_SAIDA_AGENTE = {
  type: 'object',
  additionalProperties: false,
  required: [
    'diagnostico',
    'mensagem',
    'etapa',
    'resumo',
    'proximo_followup',
    'angulo',
    'passar_para_humano',
    'nao_contatar',
    'motivo',
  ],
  properties: {
    diagnostico: { type: 'string' },
    mensagem: { type: 'string' },
    etapa: { type: 'string', enum: [...ETAPAS_VENDAS] },
    resumo: { type: 'string' },
    proximo_followup: { type: 'string', description: 'AAAA-MM-DD ou vazio' },
    angulo: { type: 'string', enum: [...ANGULOS] },
    passar_para_humano: { type: 'boolean' },
    nao_contatar: { type: 'boolean' },
    motivo: { type: 'string' },
  },
} as const;

export type LeituraSaida = { ok: true; saida: SaidaAgente } | { ok: false; erro: string };

export const ERRO_FORMATO = 'A IA respondeu fora do formato. Tente gerar de novo.';

/** Lê o texto do provedor: aceita o JSON puro ou dentro de ```json ... ```. */
export function lerSaidaAgente(texto: string): LeituraSaida {
  const limpo = texto
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  let bruto: unknown;
  try {
    bruto = JSON.parse(limpo);
  } catch {
    return { ok: false, erro: ERRO_FORMATO };
  }
  const v = saidaAgenteSchema.safeParse(bruto);
  if (!v.success) return { ok: false, erro: ERRO_FORMATO };
  return { ok: true, saida: { ...v.data, mensagem: semTravessao(v.data.mensagem) } };
}

/** Prompt de versão: lê o "versao:" do cabeçalho do arquivo; o corpo é o resto. */
export function lerArquivoPrompt(conteudo: string): { versao: string; texto: string } {
  const m = conteudo.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const versao = m?.[1]?.match(/^versao:\s*(\S+)/m)?.[1] ?? 'sem-versao';
  return { versao, texto: (m ? conteudo.slice(m[0].length) : conteudo).trim() };
}

export type SituacaoLead = {
  nome: string;
  buffet: string | null;
  cidade: string | null;
  etapa: string;
  resumo: string | null;
  tentativas: number;
};

/**
 * Texto que vai como mensagem do usuário para o agente: base de conhecimento, o lead, o
 * histórico e o que o Gui colou agora. "Hoje" vem do servidor (no fuso de São Paulo).
 */
export function montarSituacao(p: {
  hoje: string;
  base: string;
  lead: SituacaoLead;
  historico: string[];
  entrada: string;
  /** Seção de exemplos (boas, ruins e correções); vazia quando não há. */
  exemplos?: string;
}): string {
  const lead = [
    `Nome: ${p.lead.nome}`,
    p.lead.buffet && `Buffet: ${p.lead.buffet}`,
    p.lead.cidade && `Cidade: ${p.lead.cidade}`,
    `Etapa atual: ${p.lead.etapa}`,
    `Tentativas sem resposta: ${p.lead.tentativas}`,
    p.lead.resumo && `Resumo até agora: ${p.lead.resumo}`,
  ]
    .filter(Boolean)
    .join('\n');
  return [
    `Hoje é ${p.hoje}.`,
    `# Base de conhecimento (só afirme o que está aqui)\n${p.base}`,
    `# Lead\n${lead}`,
    `# Histórico da conversa\n${p.historico.length ? p.historico.join('\n') : '(sem mensagens ainda)'}`,
    ...(p.exemplos ? [p.exemplos] : []),
    `# O que o Gui colou agora\n${p.entrada}`,
  ].join('\n\n');
}

export type MensagemHistorico = { autor: 'lead' | 'gui' | 'conversa'; texto: string };

const ROTULO_AUTOR: Record<MensagemHistorico['autor'], string> = {
  lead: 'Lead',
  gui: 'Gui',
  conversa: 'Conversa colada',
};

/** Histórico em linhas para o agente ("Lead: ...", "Gui: ..."), na ordem em que aconteceu. */
export function historicoParaPrompt(mensagens: MensagemHistorico[]): string[] {
  return mensagens.map((m) => `${ROTULO_AUTOR[m.autor]}: ${m.texto.trim()}`);
}

/**
 * Regra do Gui: nada de travessão nas mensagens. O que o copiloto mandar com "—" ou "–" vira
 * vírgula (a regra também está no prompt; aqui é a garantia).
 */
export function semTravessao(texto: string): string {
  return texto
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/^,\s*/gm, '')
    .trim();
}
