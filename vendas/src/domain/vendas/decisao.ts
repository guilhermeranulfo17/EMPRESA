import { z } from 'zod';
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

export type LeadAntes = { etapa: EtapaVendas; naoContatar: boolean };

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
 * Ao aprovar: o resumo e o próximo follow-up passam a ser os do copiloto, a conversa voltou a
 * andar (tentativas sem resposta zeram), o pedido de parar vira "não contatar" e, se a etapa
 * mudou, o card anda com o motivo do copiloto.
 */
export function planoAprovacao(antes: LeadAntes, saida: SaidaAgente): PlanoAprovacao {
  const resumo = saida.resumo.trim();
  const motivo = (saida.motivo.trim() || MOTIVO_PADRAO).slice(0, 500);
  return {
    lead: {
      ...(resumo ? { resumo } : {}),
      proximoFollowup: saida.nao_contatar ? null : saida.proximo_followup || null,
      tentativas: 0,
      ...(saida.nao_contatar && !antes.naoContatar ? { naoContatar: true as const } : {}),
    },
    movimento: saida.etapa !== antes.etapa ? { de: antes.etapa, para: saida.etapa, motivo } : null,
  };
}
