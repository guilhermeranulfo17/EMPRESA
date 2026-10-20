import 'server-only';
import { CHAVES_MODELO, type ChaveModelo } from '@/domain/vendas/modelos';
import { hojeNoFuso } from '@/domain/dates';
import { obterDb } from '@/server/db/client';
import { vendasAjustes, vendasModelos } from '@/server/db/schema';

/* Leituras dos modelos de mensagem e dos ajustes das metas. Só depois de exigirGui(). */

export type Modelos = Record<ChaveModelo, string>;

/** Os 5 modelos, na ordem da cadência. Modelo que faltar no banco vem vazio. */
export async function listarModelos(): Promise<Modelos> {
  const linhas = await obterDb().select().from(vendasModelos);
  const porChave = new Map(linhas.map((l) => [l.chave, l.texto]));
  return Object.fromEntries(CHAVES_MODELO.map((c) => [c, porChave.get(c) ?? ''])) as Modelos;
}

export type Ajustes = { metaDiaria: number; inicioMetas: string };

export async function carregarAjustes(): Promise<Ajustes> {
  const [a] = await obterDb().select().from(vendasAjustes).limit(1);
  return a
    ? { metaDiaria: a.metaDiaria, inicioMetas: a.inicioMetas }
    : { metaDiaria: 10, inicioMetas: hojeNoFuso() };
}
