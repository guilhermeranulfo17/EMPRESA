import type { Prioridade } from './campos';
import { encerrada, ETAPAS_VENDAS, type EtapaVendas } from './etapas';

/*
 * Mudança de etapa à mão (1 toque na lista, no lead ou arrastando no kanban). Grava a etapa nova
 * e um movimento com origem e motivo. Qualquer etapa pode ir para qualquer outra (é o Gui
 * corrigindo); só não registra movimento para a mesma etapa.
 */

export const MOTIVO_MANUAL = 'Mudança manual';
export const LIMITE_MOTIVO = 500;

export type CardPipeline = {
  id: string;
  nome: string;
  cidade: string | null;
  uf: string | null;
  prioridade: Prioridade | null;
  etapa: EtapaVendas;
  proximoFollowup: string | null;
  naoContatar: boolean;
};

/** Cards por etapa, na ordem das colunas (toda etapa aparece, mesmo vazia). */
export function agruparPorEtapa<T extends { etapa: EtapaVendas }>(
  cards: T[],
): Record<EtapaVendas, T[]> {
  const grupos = Object.fromEntries(ETAPAS_VENDAS.map((e) => [e, [] as T[]])) as Record<
    EtapaVendas,
    T[]
  >;
  for (const c of cards) grupos[c.etapa].push(c);
  return grupos;
}

export type Movimento =
  | {
      ok: true;
      para: EtapaVendas;
      motivo: string;
      /** undefined = mantém o follow-up; null = apaga. */
      proximoFollowup?: null;
      limparCadencia: boolean;
    }
  | { ok: false; erro: string };

/** Valida o movimento pedido. Encerrar ou voltar para Não contatado apaga o follow-up. */
export function validarMovimento(de: EtapaVendas, para: string, motivo?: string): Movimento {
  if (!(ETAPAS_VENDAS as readonly string[]).includes(para)) {
    return { ok: false, erro: 'Etapa inválida.' };
  }
  if (para === de) return { ok: false, erro: 'O lead já está nessa etapa.' };
  const texto = (motivo ?? '').trim();
  if (texto.length > LIMITE_MOTIVO) {
    return { ok: false, erro: `Use no máximo ${LIMITE_MOTIVO} caracteres no motivo.` };
  }
  const etapa = para as EtapaVendas;
  const zera = etapa === 'nao_contatado' || encerrada(etapa);
  return {
    ok: true,
    para: etapa,
    motivo: texto || MOTIVO_MANUAL,
    ...(zera ? { proximoFollowup: null } : {}),
    limparCadencia: etapa === 'nao_contatado',
  };
}
