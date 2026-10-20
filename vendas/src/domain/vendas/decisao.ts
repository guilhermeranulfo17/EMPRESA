import { z } from 'zod';
import { dataCivil } from '../validacao';
import type { SaidaAgente } from './agente';
import { encerrada, ETAPAS_VENDAS, type EtapaVendas } from './etapas';

/*
 * O que acontece quando o Gui aceita, edita ou recusa uma sugestão da IA. Funções puras: o
 * servidor só aplica o plano no banco.
 */

/** O que o Gui decidiu (a mensagem, a etapa e a data podem ter sido editadas). */
export const decisaoSchema = z.object({
  mensagem: z
    .string()
    .trim()
    .min(1, 'A mensagem não pode ficar vazia.')
    .max(4000, 'Mensagem longa demais.'),
  etapa: z.enum(ETAPAS_VENDAS, { error: 'Escolha a etapa.' }),
  proximoFollowup: z.union([z.literal(''), dataCivil]).transform((v) => (v === '' ? null : v)),
});
export type DecisaoEntrada = z.input<typeof decisaoSchema>;
export type Decisao = z.output<typeof decisaoSchema>;

/** Se o Gui mudou o texto (ignora só espaços nas pontas). */
export function foiEditada(sugerida: string, final: string): boolean {
  return sugerida.trim() !== final.trim();
}

export type LeadAntes = { etapa: EtapaVendas; naoContatar: boolean };

export type PlanoAprovacao = {
  lead: { resumo?: string; proximoFollowup: string | null; naoContatar?: true };
  movimento: { de: EtapaVendas; para: EtapaVendas; motivo: string } | null;
};

const MOTIVO_PADRAO = 'Sugestão da IA aceita';

/**
 * Ao aceitar: o resumo passa a ser o da IA, a etapa e o follow-up são os que o Gui confirmou
 * (etapa encerrada não tem follow-up) e o pedido de parar vira "não contatar".
 */
export function planoAprovacao(antes: LeadAntes, saida: SaidaAgente, d: Decisao): PlanoAprovacao {
  const resumo = saida.resumo.trim();
  const editouEtapa = d.etapa !== saida.etapa;
  const motivo = editouEtapa
    ? 'Etapa escolhida por você ao aceitar a sugestão'
    : (saida.motivo.trim() || MOTIVO_PADRAO).slice(0, 500);
  return {
    lead: {
      ...(resumo ? { resumo } : {}),
      proximoFollowup: encerrada(d.etapa) || saida.nao_contatar ? null : d.proximoFollowup,
      ...(saida.nao_contatar && !antes.naoContatar ? { naoContatar: true as const } : {}),
    },
    movimento: d.etapa !== antes.etapa ? { de: antes.etapa, para: d.etapa, motivo } : null,
  };
}
