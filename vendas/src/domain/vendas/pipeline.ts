import { ETAPAS_VENDAS, type EtapaVendas } from './etapas';

/*
 * Pipeline (Kanban) de vendas. Mover o card grava a etapa nova e um movimento com origem e
 * motivo. Qualquer etapa pode ir para qualquer outra (é o Gui corrigindo); só não registra
 * movimento para a mesma etapa.
 */

export const MOTIVO_MANUAL = 'Ajuste manual no pipeline';
export const LIMITE_MOTIVO = 500;

export type CardPipeline = {
  id: string;
  nome: string;
  buffet: string | null;
  cidade: string | null;
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
  { ok: true; para: EtapaVendas; motivo: string } | { ok: false; erro: string };

/** Valida o movimento pedido. Motivo vazio vira o padrão do ajuste manual. */
export function validarMovimento(de: EtapaVendas, para: string, motivo?: string): Movimento {
  if (!(ETAPAS_VENDAS as readonly string[]).includes(para)) {
    return { ok: false, erro: 'Etapa inválida.' };
  }
  if (para === de) return { ok: false, erro: 'O lead já está nessa etapa.' };
  const texto = (motivo ?? '').trim();
  if (texto.length > LIMITE_MOTIVO) {
    return { ok: false, erro: `Use no máximo ${LIMITE_MOTIVO} caracteres no motivo.` };
  }
  return { ok: true, para: para as EtapaVendas, motivo: texto || MOTIVO_MANUAL };
}
