'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { avaliacaoSchema } from '@/domain/vendas/exemplos';
import { obterDb } from '@/server/db/client';
import { vendasExemplos, vendasSugestoes } from '@/server/db/schema';
import { acao, type Resultado } from './comum';

const uuid = z.uuid();

/**
 * Marca uma mensagem do copiloto (aprovada ou descartada) como exemplo bom ou ruim, com o
 * motivo em uma frase. Marcar de novo troca a avaliação.
 */
export async function marcarExemplo(
  sugestaoId: string,
  avaliacao: string,
  motivo: string,
): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(sugestaoId).success) return { ok: false, erro: 'Mensagem não encontrada.' };
    const v = avaliacaoSchema.safeParse({ avaliacao, motivo });
    if (!v.success) return { ok: false, erro: v.error.issues[0]!.message };
    const db = obterDb();
    const [s] = await db
      .select({ id: vendasSugestoes.id })
      .from(vendasSugestoes)
      .where(
        and(
          eq(vendasSugestoes.id, sugestaoId),
          inArray(vendasSugestoes.status, ['aprovada', 'descartada']),
        ),
      )
      .limit(1);
    if (!s) return { ok: false, erro: 'Só dá para avaliar mensagens já decididas.' };
    await db
      .insert(vendasExemplos)
      .values({ sugestaoId, avaliacao: v.data.avaliacao, motivo: v.data.motivo })
      .onConflictDoUpdate({
        target: vendasExemplos.sugestaoId,
        set: { avaliacao: v.data.avaliacao, motivo: v.data.motivo },
      });
    return {
      ok: true,
      mensagem: v.data.avaliacao === 'boa' ? 'Marcada como boa.' : 'Marcada como ruim.',
    };
  });
}

/** Tira a mensagem dos exemplos (o copiloto deixa de usá-la). */
export async function removerExemplo(sugestaoId: string): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(sugestaoId).success) return { ok: false, erro: 'Exemplo não encontrado.' };
    await obterDb().delete(vendasExemplos).where(eq(vendasExemplos.sugestaoId, sugestaoId));
    return { ok: true, mensagem: 'Exemplo removido.' };
  });
}
