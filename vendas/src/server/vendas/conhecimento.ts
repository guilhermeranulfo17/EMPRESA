import 'server-only';
import { asc } from 'drizzle-orm';
import type { ItemConhecimento } from '@/domain/vendas/conhecimento';
import { obterDb } from '@/server/db/client';
import { vendasConhecimento } from '@/server/db/schema';

/** Todos os itens da base (ativos e inativos), por tipo e na ordem em que foram criados. */
export async function listarConhecimento(): Promise<ItemConhecimento[]> {
  return obterDb()
    .select({
      id: vendasConhecimento.id,
      tipo: vendasConhecimento.tipo,
      titulo: vendasConhecimento.titulo,
      conteudo: vendasConhecimento.conteudo,
      ativo: vendasConhecimento.ativo,
    })
    .from(vendasConhecimento)
    .orderBy(asc(vendasConhecimento.tipo), asc(vendasConhecimento.criadoEm));
}
