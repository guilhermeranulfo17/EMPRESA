import { somarDias } from '../dates';
import { ROTULO_SEGMENTO, type Segmento } from './campos';
import { ETAPAS_SEM_RESPOSTA, encerrada, type EtapaVendas } from './etapas';

/*
 * Modelos de mensagem e a cadência que o botão "Abrir no WhatsApp" aplica sozinho:
 *   Mensagem 1      → etapa "Mensagem 1 enviada", follow-up em 2 dias (D+2);
 *   Follow-up D+2   → etapa "Follow-up enviado", próximo em 3 dias (D+5 contando da Mensagem 1);
 *   Follow-up D+5   → continua "Follow-up enviado", prazo final em 3 dias;
 *   sem resposta até o prazo final → "Sem interesse" sozinho (registrado no histórico);
 *   respostas prontas ("quanto custa", "não tenho tempo") → o lead respondeu: etapa "Respondeu"
 *   e novo contato em 2 dias.
 */

export const CHAVES_MODELO = [
  'mensagem_1',
  'followup_2',
  'followup_5',
  'quanto_custa',
  'sem_tempo',
] as const;
export type ChaveModelo = (typeof CHAVES_MODELO)[number];

export const ROTULO_MODELO: Record<ChaveModelo, string> = {
  mensagem_1: 'Mensagem 1',
  followup_2: 'Follow-up D+2',
  followup_5: 'Follow-up D+5',
  quanto_custa: 'Resposta "quanto custa"',
  sem_tempo: 'Resposta "não tenho tempo"',
};

export const DICA_MODELO: Record<ChaveModelo, string> = {
  mensagem_1: 'Primeira mensagem. Depois de enviar, o follow-up fica agendado para daqui a 2 dias.',
  followup_2: 'Se não respondeu em 2 dias. Agenda o próximo para 3 dias depois (D+5).',
  followup_5: 'Última tentativa. Sem resposta em 3 dias, o lead vai sozinho para Sem interesse.',
  quanto_custa: 'Quando o lead pergunta o preço.',
  sem_tempo: 'Quando o lead diz que não tem tempo.',
};

export const VARIAVEIS = ['{nome}', '{cidade}', '{segmento}'] as const;

export function ehChaveModelo(v: unknown): v is ChaveModelo {
  return typeof v === 'string' && (CHAVES_MODELO as readonly string[]).includes(v);
}

export type VariaveisLead = { nome: string; cidade: string | null; segmento: Segmento | null };

/** Troca {nome}, {cidade} e {segmento}. Sem o dado, a variável some sem deixar espaço sobrando. */
export function preencherModelo(texto: string, lead: VariaveisLead): string {
  const valores: Record<string, string> = {
    nome: lead.nome.trim(),
    cidade: lead.cidade?.trim() ?? '',
    segmento: lead.segmento ? ROTULO_SEGMENTO[lead.segmento].toLowerCase() : '',
  };
  return texto
    .replace(/\{(nome|cidade|segmento)\}/gi, (_, v: string) => valores[v.toLowerCase()] ?? '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([,.!?])/g, '$1')
    .replace(/\b(em|no|na|de|do|da) +([,.!?])/gi, '$2')
    .trim();
}

export const DIAS = { aposMensagem1: 2, aposFollowup2: 3, prazoFinal: 3, aposResposta: 2 } as const;

export type LeadCadencia = { etapa: EtapaVendas; ultimoModelo: ChaveModelo | null };

export type PlanoEnvio = {
  etapa: EtapaVendas;
  proximoFollowup: string | null;
  motivo: string;
};

/** O que muda no lead quando o Gui manda um modelo pelo botão do WhatsApp. */
export function planoEnvio(lead: LeadCadencia, chave: ChaveModelo, hoje: string): PlanoEnvio {
  const antes = lead.etapa;
  const semResposta =
    antes === 'nao_contatado' || antes === 'sem_interesse' || ETAPAS_SEM_RESPOSTA.includes(antes);
  const motivo = `${ROTULO_MODELO[chave]} enviada pelo WhatsApp`;
  if (!semResposta) {
    // já respondeu, está em teste ou fechou: a etapa não volta atrás
    return {
      etapa: antes,
      proximoFollowup: encerrada(antes) ? null : somarDias(hoje, DIAS.aposResposta),
      motivo,
    };
  }
  switch (chave) {
    case 'mensagem_1':
      return { etapa: 'mensagem_1', proximoFollowup: somarDias(hoje, DIAS.aposMensagem1), motivo };
    case 'followup_2':
      return { etapa: 'followup', proximoFollowup: somarDias(hoje, DIAS.aposFollowup2), motivo };
    case 'followup_5':
      return { etapa: 'followup', proximoFollowup: somarDias(hoje, DIAS.prazoFinal), motivo };
    default:
      return { etapa: 'respondeu', proximoFollowup: somarDias(hoje, DIAS.aposResposta), motivo };
  }
}

/** O modelo que o HOJE sugere para o lead, ou null quando o próximo passo é conversar. */
export function proximoModelo(lead: LeadCadencia): ChaveModelo | null {
  if (lead.etapa === 'nao_contatado') return 'mensagem_1';
  if (lead.etapa === 'mensagem_1') return 'followup_2';
  if (lead.etapa === 'followup') {
    return lead.ultimoModelo === 'followup_5'
      ? null
      : lead.ultimoModelo === 'followup_2'
        ? 'followup_5'
        : 'followup_2';
  }
  return null;
}

export const MOTIVO_ENCERRAMENTO = 'Sem resposta depois do Follow-up D+5';

/** Mandou o Follow-up D+5 e o prazo final chegou sem resposta: vai para Sem interesse. */
export function deveEncerrar(
  lead: LeadCadencia & { proximoFollowup: string | null },
  hoje: string,
): boolean {
  return (
    lead.etapa === 'followup' &&
    lead.ultimoModelo === 'followup_5' &&
    lead.proximoFollowup !== null &&
    lead.proximoFollowup <= hoje
  );
}
