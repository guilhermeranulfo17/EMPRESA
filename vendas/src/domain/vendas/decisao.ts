import { z } from 'zod';
import { somarDias } from '@/domain/dates';
import type { SaidaAgente } from './agente';
import type { EtapaVendas } from './etapas';

/*
 * O que acontece quando o Gui decide sobre uma sugestão do copiloto. Funções puras: o servidor
 * só aplica o plano no banco.
 */

export const mensagemFinalSchema = z
  .string()
  .trim()
  .min(1, 'A mensagem não pode ficar vazia.')
  .max(4000, 'Mensagem longa demais.');

/** Link do WhatsApp com a mensagem pronta (wa.me). Sem telefone, sem link. */
export function linkWhatsApp(telefoneE164: string | null, texto: string): string | null {
  if (!telefoneE164) return null;
  const digitos = telefoneE164.replace(/\D/g, '');
  if (!digitos) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}

/** Se o Gui mudou o texto (ignora só espaços nas pontas). */
export function foiEditada(sugerida: string, final: string): boolean {
  return sugerida.trim() !== final.trim();
}

export type LeadAntes = { etapa: EtapaVendas; naoContatar: boolean; tentativas: number };

/** resposta = o Gui colou o que o lead respondeu; abordagem e followup = gerados pela fila. */
export type TipoSugestao = 'resposta' | 'abordagem' | 'followup';

/** Sem data do copiloto, a abordagem ou o follow-up volta para a fila em 3 dias. */
export const DIAS_FOLLOWUP_PADRAO = 3;

export type PlanoAprovacao = {
  /** Campos do lead que mudam. */
  lead: {
    resumo?: string;
    proximoFollowup: string | null;
    tentativas: number;
    naoContatar?: true;
  };
  /** Movimento no pipeline feito pelo copiloto, se a etapa mudou. */
  movimento: { de: EtapaVendas; para: EtapaVendas; motivo: string } | null;
};

const MOTIVO_PADRAO = 'Sugestão do copiloto aprovada';

/**
 * Ao aprovar: o resumo e o próximo follow-up passam a ser os do copiloto, o pedido de parar vira
 * "não contatar" e, se a etapa mudou, o card anda com o motivo do copiloto.
 *  - resposta: o lead respondeu, então as tentativas sem resposta zeram;
 *  - abordagem/followup: mais uma mensagem sem resposta (tentativas + 1), o lead sai de "Novo"
 *    para "Abordado" e, sem data do copiloto, volta para a fila em 3 dias.
 */
export function planoAprovacao(
  antes: LeadAntes,
  saida: SaidaAgente,
  tipo: TipoSugestao,
  hoje: string,
): PlanoAprovacao {
  const resumo = saida.resumo.trim();
  const motivo = (saida.motivo.trim() || MOTIVO_PADRAO).slice(0, 500);
  const gerada = tipo !== 'resposta';
  const etapa: EtapaVendas = gerada && saida.etapa === 'novo' ? 'abordado' : saida.etapa;
  const followup = saida.nao_contatar
    ? null
    : saida.proximo_followup || (gerada ? somarDias(hoje, DIAS_FOLLOWUP_PADRAO) : null);
  return {
    lead: {
      ...(resumo ? { resumo } : {}),
      proximoFollowup: followup,
      tentativas: gerada ? antes.tentativas + 1 : 0,
      ...(saida.nao_contatar && !antes.naoContatar ? { naoContatar: true as const } : {}),
    },
    movimento: etapa !== antes.etapa ? { de: antes.etapa, para: etapa, motivo } : null,
  };
}
