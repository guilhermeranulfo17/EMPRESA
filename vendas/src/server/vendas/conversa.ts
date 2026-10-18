import 'server-only';
import { and, asc, desc, eq } from 'drizzle-orm';
import { saidaAgenteSchema, type SaidaAgente } from '@/domain/vendas/agente';
import { obterDb } from '@/server/db/client';
import { vendasExemplos, vendasMensagens, vendasSugestoes } from '@/server/db/schema';

/* Leituras da conversa do lead. Conexão do servidor: só depois de exigirGui(). */

export type MensagemConversa = {
  id: string;
  autor: 'lead' | 'gui' | 'conversa';
  texto: string;
  criadoEm: Date;
  /** Mensagem que veio do copiloto: dá para marcar como exemplo. */
  sugestaoId: string | null;
  avaliacao: 'boa' | 'ruim' | null;
};

export type SugestaoPendente = {
  id: string;
  leadId: string;
  tipo: 'resposta' | 'abordagem' | 'followup';
  entrada: string;
  saida: SaidaAgente;
  provedor: string;
  modelo: string;
  promptVersao: string;
  criadoEm: Date;
};

/** Mensagens do lead, da mais antiga para a mais nova. */
export async function listarMensagens(leadId: string): Promise<MensagemConversa[]> {
  return obterDb()
    .select({
      id: vendasMensagens.id,
      autor: vendasMensagens.autor,
      texto: vendasMensagens.texto,
      criadoEm: vendasMensagens.criadoEm,
      sugestaoId: vendasMensagens.sugestaoId,
      avaliacao: vendasExemplos.avaliacao,
    })
    .from(vendasMensagens)
    .leftJoin(vendasExemplos, eq(vendasExemplos.sugestaoId, vendasMensagens.sugestaoId))
    .where(eq(vendasMensagens.leadId, leadId))
    .orderBy(asc(vendasMensagens.criadoEm));
}

/** A sugestão mais recente ainda sem decisão (aprovar, editar ou descartar). */
export async function carregarSugestaoPendente(leadId: string): Promise<SugestaoPendente | null> {
  const [s] = await obterDb()
    .select()
    .from(vendasSugestoes)
    .where(and(eq(vendasSugestoes.leadId, leadId), eq(vendasSugestoes.status, 'pendente')))
    .orderBy(desc(vendasSugestoes.criadoEm))
    .limit(1);
  if (!s) return null;
  const saida = saidaAgenteSchema.safeParse(s.saida);
  if (!saida.success) return null;
  return {
    id: s.id,
    leadId: s.leadId,
    tipo: s.tipo,
    entrada: s.entrada,
    saida: saida.data,
    provedor: s.provedor,
    modelo: s.modelo,
    promptVersao: s.promptVersao,
    criadoEm: s.criadoEm,
  };
}

/** Sugestões pendentes de vários leads de uma vez (Fila do dia). */
export async function sugestoesPendentes(): Promise<Map<string, SugestaoPendente>> {
  const linhas = await obterDb()
    .select()
    .from(vendasSugestoes)
    .where(eq(vendasSugestoes.status, 'pendente'))
    .orderBy(desc(vendasSugestoes.criadoEm));
  const porLead = new Map<string, SugestaoPendente>();
  for (const s of linhas) {
    if (porLead.has(s.leadId)) continue;
    const saida = saidaAgenteSchema.safeParse(s.saida);
    if (!saida.success) continue;
    porLead.set(s.leadId, {
      id: s.id,
      leadId: s.leadId,
      tipo: s.tipo,
      entrada: s.entrada,
      saida: saida.data,
      provedor: s.provedor,
      modelo: s.modelo,
      promptVersao: s.promptVersao,
      criadoEm: s.criadoEm,
    });
  }
  return porLead;
}
