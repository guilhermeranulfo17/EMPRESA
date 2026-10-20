import { z } from 'zod';
import { ROTULO_SEGMENTO, rotuloCidade, type Segmento } from './campos';
import { ETAPAS_VENDAS, ROTULO_ETAPA_VENDAS, type EtapaVendas } from './etapas';

/*
 * Saída do assistente de IA. O provedor recebe o JSON Schema abaixo e a resposta é validada de
 * novo aqui com Zod. Resposta inválida nunca é gravada: vira um erro amigável.
 * (Sugestões antigas tinham mais campos, como diagnostico e angulo: o Zod só ignora.)
 */

export const saidaAgenteSchema = z.object({
  resumo: z.string().trim().min(1).max(2000),
  etapa: z.enum(ETAPAS_VENDAS),
  mensagem: z.string().trim().max(4000),
  proximo_followup: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
  motivo: z.string().trim().max(500),
  nao_contatar: z.boolean(),
});
export type SaidaAgente = z.infer<typeof saidaAgenteSchema>;

/** O mesmo formato em JSON Schema, para o provedor gerar a resposta já no formato. */
export const SCHEMA_SAIDA_AGENTE = {
  type: 'object',
  additionalProperties: false,
  required: ['resumo', 'etapa', 'mensagem', 'proximo_followup', 'motivo', 'nao_contatar'],
  properties: {
    resumo: { type: 'string', description: 'Resumo da conversa em no máximo 2 linhas.' },
    etapa: { type: 'string', enum: [...ETAPAS_VENDAS] },
    mensagem: { type: 'string', description: 'Próxima mensagem para o Gui mandar no WhatsApp.' },
    proximo_followup: { type: 'string', description: 'AAAA-MM-DD ou vazio' },
    motivo: { type: 'string', description: 'Por que essa etapa e essa data, em uma frase.' },
    nao_contatar: { type: 'boolean' },
  },
} as const;

export type LeituraSaida = { ok: true; saida: SaidaAgente } | { ok: false; erro: string };

export const ERRO_FORMATO = 'A IA respondeu fora do formato. Tente de novo.';

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
  return {
    ok: true,
    saida: {
      ...v.data,
      mensagem: semTravessao(v.data.mensagem),
      resumo: semTravessao(v.data.resumo),
      motivo: semTravessao(v.data.motivo),
    },
  };
}

/** Prompt de versão: lê o "versao:" do cabeçalho do arquivo; o corpo é o resto. */
export function lerArquivoPrompt(conteudo: string): { versao: string; texto: string } {
  const m = conteudo.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const versao = m?.[1]?.match(/^versao:\s*(\S+)/m)?.[1] ?? 'sem-versao';
  return { versao, texto: (m ? conteudo.slice(m[0].length) : conteudo).trim() };
}

export type SituacaoLead = {
  nome: string;
  cidade: string | null;
  uf: string | null;
  segmento: Segmento | null;
  categoria: string | null;
  etapa: EtapaVendas;
  resumo: string | null;
  observacoes: string | null;
  proximoFollowup: string | null;
};

/**
 * Texto que vai como mensagem do usuário para a IA: base de conhecimento, o lead, o que já foi
 * registrado, as correções do Gui e a conversa colada agora. "Hoje" vem do servidor.
 */
export function montarSituacao(p: {
  hoje: string;
  base: string;
  lead: SituacaoLead;
  historico: string[];
  entrada: string;
  /** Seção de exemplos e correções; vazia quando não há. */
  exemplos?: string;
}): string {
  const l = p.lead;
  const lead = [
    `Empresa: ${l.nome}`,
    (l.cidade || l.uf) && `Cidade: ${rotuloCidade(l.cidade, l.uf)}`,
    l.segmento && `Segmento: ${ROTULO_SEGMENTO[l.segmento]}`,
    l.categoria && `Categoria no Google: ${l.categoria}`,
    `Etapa atual: ${ROTULO_ETAPA_VENDAS[l.etapa]} (${l.etapa})`,
    l.proximoFollowup && `Follow-up marcado: ${l.proximoFollowup}`,
    l.resumo && `Resumo até agora: ${l.resumo}`,
    l.observacoes && `Observações do Gui: ${l.observacoes}`,
  ]
    .filter(Boolean)
    .join('\n');
  return [
    `Hoje é ${p.hoje}.`,
    ...(p.base.trim()
      ? [`# Base de conhecimento (só afirme o que está aqui ou no contexto)\n${p.base}`]
      : []),
    `# Lead\n${lead}`,
    `# Mensagens já registradas no CRM\n${p.historico.length ? p.historico.join('\n') : '(nenhuma)'}`,
    ...(p.exemplos ? [p.exemplos] : []),
    `# Conversa do WhatsApp colada agora\n${p.entrada}`,
  ].join('\n\n');
}

export type MensagemHistorico = { autor: 'lead' | 'gui' | 'conversa'; texto: string };

const ROTULO_AUTOR: Record<MensagemHistorico['autor'], string> = {
  lead: 'Lead',
  gui: 'Gui',
  conversa: 'Conversa colada',
};

/** Histórico em linhas para a IA ("Lead: ...", "Gui: ..."), na ordem em que aconteceu. */
export function historicoParaPrompt(mensagens: MensagemHistorico[], limite = 12): string[] {
  return mensagens
    .slice(-limite)
    .map((m) => `${ROTULO_AUTOR[m.autor]}: ${m.texto.trim().slice(0, 1500)}`);
}

/**
 * Regra do Gui: nada de travessão. O que a IA mandar com "—" ou "–" vira vírgula (a regra também
 * está no prompt; aqui é a garantia).
 */
export function semTravessao(texto: string): string {
  return texto
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/^,\s*/gm, '')
    .trim();
}
