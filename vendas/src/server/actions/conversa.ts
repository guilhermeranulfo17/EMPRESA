'use server';

import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hojeNoFuso } from '@/domain/dates';
import { historicoParaPrompt, montarSituacao, type SaidaAgente } from '@/domain/vendas/agente';
import { baseParaPrompt } from '@/domain/vendas/conhecimento';
import { ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMensagens, vendasSugestoes } from '@/server/db/schema';
import { exigirGui } from '@/server/guard';
import { chamarCopiloto } from '@/server/ia/copiloto';
import { listarConhecimento } from '@/server/vendas/conhecimento';

export type ResultadoGerar =
  { ok: true; sugestaoId: string; saida: SaidaAgente } | { ok: false; erro: string };

const uuid = z.uuid();
const entradaSchema = z
  .string()
  .trim()
  .min(1, 'Cole a resposta do lead ou a conversa.')
  .max(20000, 'Texto longo demais. Cole só a parte nova da conversa.');

/**
 * "Gerar resposta": manda para o copiloto a base de conhecimento, o lead, o histórico e o que o
 * Gui colou, e guarda a sugestão como pendente (a decisão vem depois). Uma sugestão nova
 * substitui a pendente anterior do mesmo lead.
 */
export async function gerarResposta(leadId: string, texto: string): Promise<ResultadoGerar> {
  await exigirGui();
  if (!uuid.safeParse(leadId).success) return { ok: false, erro: 'Lead não encontrado.' };
  const entrada = entradaSchema.safeParse(texto);
  if (!entrada.success) return { ok: false, erro: entrada.error.issues[0]!.message };
  try {
    const db = obterDb();
    const [lead] = await db.select().from(vendasLeads).where(eq(vendasLeads.id, leadId)).limit(1);
    if (!lead) return { ok: false, erro: 'Lead não encontrado.' };
    if (lead.naoContatar) {
      return { ok: false, erro: 'Esse lead pediu para não ser contatado. Nada foi gerado.' };
    }
    const [mensagens, base] = await Promise.all([
      db
        .select({ autor: vendasMensagens.autor, texto: vendasMensagens.texto })
        .from(vendasMensagens)
        .where(eq(vendasMensagens.leadId, leadId))
        .orderBy(asc(vendasMensagens.criadoEm)),
      listarConhecimento(),
    ]);
    const usuario = montarSituacao({
      hoje: hojeNoFuso(),
      base: baseParaPrompt(base),
      lead: {
        nome: lead.nome,
        buffet: lead.buffet,
        cidade: lead.cidade,
        etapa: ROTULO_ETAPA_VENDAS[lead.etapa],
        resumo: lead.resumo,
        tentativas: lead.tentativas,
      },
      historico: historicoParaPrompt(mensagens),
      entrada: entrada.data,
    });
    const r = await chamarCopiloto(usuario);
    if (!r.ok) return { ok: false, erro: r.erro };

    const sugestaoId = await db.transaction(async (tx) => {
      await tx
        .update(vendasSugestoes)
        .set({ status: 'descartada', decididoEm: new Date() })
        .where(and(eq(vendasSugestoes.leadId, leadId), eq(vendasSugestoes.status, 'pendente')));
      const [s] = await tx
        .insert(vendasSugestoes)
        .values({
          leadId,
          entrada: entrada.data,
          saida: r.saida,
          mensagemSugerida: r.saida.mensagem,
          promptVersao: r.promptVersao,
          provedor: r.provedor,
          modelo: r.modelo,
        })
        .returning({ id: vendasSugestoes.id });
      return s!.id;
    });
    revalidatePath(`/leads/${leadId}`);
    return { ok: true, sugestaoId, saida: r.saida };
  } catch {
    return { ok: false, erro: 'Não foi possível gerar a resposta agora.' };
  }
}
