'use server';

import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hojeNoFuso } from '@/domain/dates';
import {
  historicoParaPrompt,
  montarSituacao,
  saidaAgenteSchema,
  type SaidaAgente,
} from '@/domain/vendas/agente';
import { baseParaPrompt } from '@/domain/vendas/conhecimento';
import {
  decisaoSchema,
  foiEditada,
  planoAprovacao,
  type DecisaoEntrada,
} from '@/domain/vendas/decisao';
import { exemplosParaPrompt, idsUsados, selecionarExemplos } from '@/domain/vendas/exemplos';
import { obterDb } from '@/server/db/client';
import {
  vendasLeads,
  vendasMensagens,
  vendasMovimentos,
  vendasSugestoes,
} from '@/server/db/schema';
import { exigirGui } from '@/server/guard';
import { chamarCopiloto } from '@/server/ia/copiloto';
import { listarConhecimento } from '@/server/vendas/conhecimento';
import { listarExemplos, listarParesEditados } from '@/server/vendas/exemplos';
import { acao, camposDoZod, INVALIDO, type Resultado } from './comum';

export type ResultadoAnalise =
  { ok: true; sugestaoId: string; saida: SaidaAgente } | { ok: false; erro: string };

const uuid = z.uuid();
const entradaSchema = z
  .string()
  .trim()
  .min(1, 'Cole a conversa do WhatsApp.')
  .max(20000, 'Texto longo demais. Cole só a parte nova da conversa.');

/**
 * "Analisar com IA": o Gui colou a conversa do WhatsApp. Junta a base de conhecimento, o lead, o
 * que já foi registrado, as últimas correções dele e a conversa; guarda a sugestão como pendente
 * (a decisão vem depois). Uma análise nova substitui a pendente anterior do mesmo lead.
 */
export async function analisarConversa(leadId: string, texto: string): Promise<ResultadoAnalise> {
  await exigirGui();
  if (!uuid.safeParse(leadId).success) return { ok: false, erro: 'Lead não encontrado.' };
  const entrada = entradaSchema.safeParse(texto);
  if (!entrada.success) return { ok: false, erro: entrada.error.issues[0]!.message };
  try {
    const db = obterDb();
    const [lead] = await db.select().from(vendasLeads).where(eq(vendasLeads.id, leadId)).limit(1);
    if (!lead) return { ok: false, erro: 'Lead não encontrado.' };
    const [mensagens, base, exemplos, pares] = await Promise.all([
      db
        .select({ autor: vendasMensagens.autor, texto: vendasMensagens.texto })
        .from(vendasMensagens)
        .where(eq(vendasMensagens.leadId, leadId))
        .orderBy(asc(vendasMensagens.criadoEm)),
      listarConhecimento(),
      listarExemplos(),
      listarParesEditados(),
    ]);
    const escolhidos = selecionarExemplos(
      { texto: entrada.data, etapa: lead.etapa },
      exemplos,
      pares,
    );
    const usuario = montarSituacao({
      hoje: hojeNoFuso(),
      base: baseParaPrompt(base),
      lead,
      historico: historicoParaPrompt(mensagens),
      exemplos: exemplosParaPrompt(escolhidos),
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
          tipo: 'resposta',
          entrada: entrada.data,
          saida: r.saida,
          mensagemSugerida: r.saida.mensagem,
          promptVersao: r.promptVersao,
          provedor: r.provedor,
          modelo: r.modelo,
          exemplosUsados: idsUsados(escolhidos),
        })
        .returning({ id: vendasSugestoes.id });
      return s!.id;
    });
    revalidatePath('/', 'layout');
    return { ok: true, sugestaoId, saida: r.saida };
  } catch {
    return { ok: false, erro: 'Não foi possível analisar a conversa agora.' };
  }
}

/**
 * Aceitar (com ou sem edição): a conversa colada e a sua mensagem entram no histórico, o lead
 * recebe o resumo da IA, a etapa e o follow-up que você confirmou. Se você editou o texto, a
 * versão original e a sua ficam guardadas: as últimas correções entram nas próximas análises.
 */
export async function aceitarSugestao(
  sugestaoId: string,
  entrada: DecisaoEntrada,
): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(sugestaoId).success) return { ok: false, erro: 'Sugestão não encontrada.' };
    const d = decisaoSchema.safeParse(entrada);
    if (!d.success) return { ok: false, erro: INVALIDO, campos: camposDoZod(d.error) };
    return obterDb().transaction(async (tx): Promise<Resultado> => {
      const [s] = await tx
        .select()
        .from(vendasSugestoes)
        .where(eq(vendasSugestoes.id, sugestaoId))
        .for('update');
      if (!s) return { ok: false, erro: 'Sugestão não encontrada.' };
      if (s.status !== 'pendente') return { ok: false, erro: 'Essa sugestão já foi decidida.' };
      const saida = saidaAgenteSchema.safeParse(s.saida);
      if (!saida.success) return { ok: false, erro: 'Sugestão inválida. Analise de novo.' };
      const [lead] = await tx
        .select({ etapa: vendasLeads.etapa, naoContatar: vendasLeads.naoContatar })
        .from(vendasLeads)
        .where(eq(vendasLeads.id, s.leadId))
        .for('update');
      if (!lead) return { ok: false, erro: 'Lead não encontrado.' };

      const plano = planoAprovacao(lead, saida.data, d.data);
      const agora = new Date();
      await tx
        .update(vendasSugestoes)
        .set({
          status: 'aprovada',
          mensagemFinal: d.data.mensagem,
          editada: foiEditada(s.mensagemSugerida, d.data.mensagem),
          final: { etapa: d.data.etapa, proximoFollowup: d.data.proximoFollowup },
          decididoEm: agora,
        })
        .where(eq(vendasSugestoes.id, s.id));
      await tx
        .insert(vendasMensagens)
        .values({ leadId: s.leadId, autor: 'conversa', texto: s.entrada });
      // um instante depois, para a ordem do histórico ficar certa
      await tx.insert(vendasMensagens).values({
        leadId: s.leadId,
        autor: 'gui',
        texto: d.data.mensagem,
        sugestaoId: s.id,
        criadoEm: new Date(agora.getTime() + 1),
      });
      await tx
        .update(vendasLeads)
        .set({
          ...plano.lead,
          ...(plano.lead.naoContatar ? { naoContatarEm: agora } : {}),
          ...(plano.movimento ? { etapa: plano.movimento.para } : {}),
        })
        .where(eq(vendasLeads.id, s.leadId));
      if (plano.movimento) {
        await tx.insert(vendasMovimentos).values({
          leadId: s.leadId,
          de: plano.movimento.de,
          para: plano.movimento.para,
          origem: 'agente',
          motivo: plano.movimento.motivo,
          sugestaoId: s.id,
        });
      }
      return { ok: true, mensagem: 'Sugestão aceita.' };
    });
  });
}

/** Recusar: a sugestão sai da tela e nada muda no lead. */
export async function recusarSugestao(sugestaoId: string): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(sugestaoId).success) return { ok: false, erro: 'Sugestão não encontrada.' };
    const r = await obterDb()
      .update(vendasSugestoes)
      .set({ status: 'descartada', decididoEm: new Date() })
      .where(and(eq(vendasSugestoes.id, sugestaoId), eq(vendasSugestoes.status, 'pendente')))
      .returning({ id: vendasSugestoes.id });
    if (!r.length) return { ok: false, erro: 'Essa sugestão já foi decidida.' };
    return { ok: true, mensagem: 'Sugestão recusada.' };
  });
}
