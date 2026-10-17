'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { EtapaVendas } from '@/domain/vendas/etapas';
import { validarMovimento } from '@/domain/vendas/pipeline';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMovimentos } from '@/server/db/schema';
import { acao, type Resultado } from './comum';

const uuid = z.uuid();

/** Move o lead de etapa (arrastar no Kanban ou "Mover para"). Grava o movimento com o motivo. */
export async function moverLead(
  id: string,
  para: string,
  motivo?: string,
): Promise<Resultado<{ etapa: EtapaVendas }>> {
  return acao(async () => {
    if (!uuid.safeParse(id).success) return { ok: false, erro: 'Lead não encontrado.' };
    return obterDb().transaction(async (tx): Promise<Resultado<{ etapa: EtapaVendas }>> => {
      const [atual] = await tx
        .select({ etapa: vendasLeads.etapa })
        .from(vendasLeads)
        .where(eq(vendasLeads.id, id))
        .for('update');
      if (!atual) return { ok: false, erro: 'Lead não encontrado.' };
      const m = validarMovimento(atual.etapa, para, motivo);
      if (!m.ok) return { ok: false, erro: m.erro };
      await tx.update(vendasLeads).set({ etapa: m.para }).where(eq(vendasLeads.id, id));
      await tx.insert(vendasMovimentos).values({
        leadId: id,
        de: atual.etapa,
        para: m.para,
        origem: 'manual',
        motivo: m.motivo,
      });
      return { ok: true, mensagem: 'Lead movido.', dados: { etapa: m.para } };
    });
  });
}
