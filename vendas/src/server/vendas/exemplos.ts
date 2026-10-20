import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { saidaAgenteSchema } from '@/domain/vendas/agente';
import type { Exemplo, ParEditado } from '@/domain/vendas/exemplos';
import { obterDb } from '@/server/db/client';
import { vendasExemplos, vendasLeads, vendasSugestoes } from '@/server/db/schema';

/* Leituras dos exemplos (boas, ruins e correções). Conexão do servidor: só depois de exigirGui(). */

const LIMITE = 300;

export type ExemploTela = Exemplo & { leadId: string; leadNome: string; criadoEm: Date };
export type ParTela = ParEditado & { leadId: string; leadNome: string; decididoEm: Date | null };

/** Exemplos marcados, mais recentes primeiro. */
export async function listarExemplos(): Promise<ExemploTela[]> {
  const linhas = await obterDb()
    .select({
      sugestaoId: vendasExemplos.sugestaoId,
      avaliacao: vendasExemplos.avaliacao,
      motivo: vendasExemplos.motivo,
      criadoEm: vendasExemplos.criadoEm,
      entrada: vendasSugestoes.entrada,
      sugerida: vendasSugestoes.mensagemSugerida,
      final: vendasSugestoes.mensagemFinal,
      saida: vendasSugestoes.saida,
      leadId: vendasLeads.id,
      leadNome: vendasLeads.nome,
    })
    .from(vendasExemplos)
    .innerJoin(vendasSugestoes, eq(vendasSugestoes.id, vendasExemplos.sugestaoId))
    .innerJoin(vendasLeads, eq(vendasLeads.id, vendasSugestoes.leadId))
    .orderBy(desc(vendasExemplos.criadoEm))
    .limit(LIMITE);
  return linhas.map((l) => ({
    sugestaoId: l.sugestaoId,
    avaliacao: l.avaliacao,
    motivo: l.motivo,
    entrada: l.entrada,
    mensagem: l.final ?? l.sugerida,
    etapa: saidaAgenteSchema.safeParse(l.saida).data?.etapa ?? 'nao_contatado',
    leadId: l.leadId,
    leadNome: l.leadNome,
    criadoEm: l.criadoEm,
  }));
}

/** Sugestões aprovadas que o Gui editou antes de mandar, mais recentes primeiro. */
export async function listarParesEditados(): Promise<ParTela[]> {
  const linhas = await obterDb()
    .select({
      sugestaoId: vendasSugestoes.id,
      entrada: vendasSugestoes.entrada,
      sugerida: vendasSugestoes.mensagemSugerida,
      final: vendasSugestoes.mensagemFinal,
      saida: vendasSugestoes.saida,
      decididoEm: vendasSugestoes.decididoEm,
      leadId: vendasLeads.id,
      leadNome: vendasLeads.nome,
    })
    .from(vendasSugestoes)
    .innerJoin(vendasLeads, eq(vendasLeads.id, vendasSugestoes.leadId))
    .where(and(eq(vendasSugestoes.status, 'aprovada'), eq(vendasSugestoes.editada, true)))
    .orderBy(desc(vendasSugestoes.decididoEm))
    .limit(LIMITE);
  return linhas.map((l) => ({
    sugestaoId: l.sugestaoId,
    entrada: l.entrada,
    sugerida: l.sugerida,
    final: l.final ?? l.sugerida,
    etapa: saidaAgenteSchema.safeParse(l.saida).data?.etapa ?? 'nao_contatado',
    leadId: l.leadId,
    leadNome: l.leadNome,
    decididoEm: l.decididoEm,
  }));
}
