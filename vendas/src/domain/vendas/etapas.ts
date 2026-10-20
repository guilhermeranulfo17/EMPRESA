/*
 * Etapas do funil de prospecção. Espelho do enum public.vendas_etapa (migration
 * 20261019000001_prospeccao).
 */

export const ETAPAS_VENDAS = [
  'nao_contatado',
  'mensagem_1',
  'followup',
  'respondeu',
  'em_teste',
  'fechou',
  'sem_interesse',
] as const;
export type EtapaVendas = (typeof ETAPAS_VENDAS)[number];

export const ROTULO_ETAPA_VENDAS: Record<EtapaVendas, string> = {
  nao_contatado: 'Não contatado',
  mensagem_1: 'Mensagem 1 enviada',
  followup: 'Follow-up enviado',
  respondeu: 'Respondeu',
  em_teste: 'Em teste',
  fechou: 'Fechou',
  sem_interesse: 'Sem interesse',
};

/** Rótulo curto para chips e colunas estreitas. */
export const ROTULO_CURTO_ETAPA: Record<EtapaVendas, string> = {
  nao_contatado: 'Não contatado',
  mensagem_1: 'Mensagem 1',
  followup: 'Follow-up',
  respondeu: 'Respondeu',
  em_teste: 'Em teste',
  fechou: 'Fechou',
  sem_interesse: 'Sem interesse',
};

/** Cor do chip de cada etapa (classes do tema). */
export const COR_ETAPA: Record<EtapaVendas, string> = {
  nao_contatado: 'bg-muted text-muted-foreground',
  mensagem_1: 'bg-info/15 text-info',
  followup: 'bg-alerta/15 text-alerta',
  respondeu: 'bg-primary/15 text-primary',
  em_teste: 'bg-roxo/15 text-roxo',
  fechou: 'bg-primary text-primary-foreground',
  sem_interesse: 'bg-erro/15 text-erro',
};

export function ehEtapa(valor: unknown): valor is EtapaVendas {
  return typeof valor === 'string' && (ETAPAS_VENDAS as readonly string[]).includes(valor);
}

/** A negociação acabou: sai do HOJE e dos follow-ups. */
export const ETAPAS_ENCERRADAS: readonly EtapaVendas[] = ['fechou', 'sem_interesse'];

/** Mandou mensagem e ainda não teve resposta. */
export const ETAPAS_SEM_RESPOSTA: readonly EtapaVendas[] = ['mensagem_1', 'followup'];

/** O lead respondeu (a taxa de resposta conta estes). */
export const ETAPAS_RESPONDERAM: readonly EtapaVendas[] = ['respondeu', 'em_teste', 'fechou'];

export const encerrada = (e: EtapaVendas) => ETAPAS_ENCERRADAS.includes(e);
