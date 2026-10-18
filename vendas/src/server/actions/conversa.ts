'use server';

import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hojeNoFuso } from '@/domain/dates';
import {
  historicoParaPrompt,
  montarSituacao,
  saidaAgenteSchema,
  type Angulo,
  type SaidaAgente,
} from '@/domain/vendas/agente';
import { baseParaPrompt } from '@/domain/vendas/conhecimento';
import { ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { obterDb } from '@/server/db/client';
import {
  foiEditada,
  mensagemFinalSchema,
  planoAprovacao,
  type TipoSugestao,
} from '@/domain/vendas/decisao';
import { exemplosParaPrompt, idsUsados, selecionarExemplos } from '@/domain/vendas/exemplos';
import { instrucaoGerada, MAX_TENTATIVAS, tipoParaGerar } from '@/domain/vendas/fila';
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
import { acao, type Resultado } from './comum';

export type ResultadoGerar =
  { ok: true; sugestaoId: string; saida: SaidaAgente } | { ok: false; erro: string };

const uuid = z.uuid();
const entradaSchema = z
  .string()
  .trim()
  .min(1, 'Cole a resposta do lead ou a conversa.')
  .max(20000, 'Texto longo demais. Cole só a parte nova da conversa.');

/**
 * Pede uma sugestão ao copiloto e guarda como pendente (a decisão vem depois). Junta a base de
 * conhecimento, o lead, o histórico, os exemplos mais parecidos e a entrada. Uma sugestão nova
 * substitui a pendente anterior do mesmo lead.
 */
async function criarSugestao(
  leadId: string,
  pedido: { tipo: 'resposta'; texto: string } | { tipo: 'gerada' },
): Promise<ResultadoGerar> {
  const db = obterDb();
  const [lead] = await db.select().from(vendasLeads).where(eq(vendasLeads.id, leadId)).limit(1);
  if (!lead) return { ok: false, erro: 'Lead não encontrado.' };
  if (lead.naoContatar) {
    return { ok: false, erro: 'Esse lead pediu para não ser contatado. Nada foi gerado.' };
  }
  const [mensagens, base, exemplos, pares, anteriores] = await Promise.all([
    db
      .select({ autor: vendasMensagens.autor, texto: vendasMensagens.texto })
      .from(vendasMensagens)
      .where(eq(vendasMensagens.leadId, leadId))
      .orderBy(asc(vendasMensagens.criadoEm)),
    listarConhecimento(),
    listarExemplos(),
    listarParesEditados(),
    db
      .select({ saida: vendasSugestoes.saida })
      .from(vendasSugestoes)
      .where(and(eq(vendasSugestoes.leadId, leadId), eq(vendasSugestoes.status, 'aprovada'))),
  ]);

  let tipo: TipoSugestao = 'resposta';
  let entrada: string;
  if (pedido.tipo === 'resposta') {
    entrada = pedido.texto;
  } else {
    tipo = tipoParaGerar(lead);
    if (tipo === 'followup' && lead.tentativas >= MAX_TENTATIVAS) {
      return {
        ok: false,
        erro: `Já foram ${MAX_TENTATIVAS} tentativas sem resposta. Encerre o lead ou espere ele responder.`,
      };
    }
    const angulos = anteriores
      .map((a) => saidaAgenteSchema.safeParse(a.saida).data?.angulo)
      .filter((a): a is Angulo => !!a);
    entrada = instrucaoGerada(tipo, lead.tentativas, angulos);
  }

  const escolhidos = selecionarExemplos(
    { texto: pedido.tipo === 'resposta' ? entrada : (lead.resumo ?? ''), etapa: lead.etapa },
    exemplos,
    pares,
  );
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
    exemplos: exemplosParaPrompt(escolhidos),
    entrada,
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
        tipo,
        entrada,
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
}

/** "Gerar resposta": o Gui colou o que o lead respondeu (ou a conversa inteira). */
export async function gerarResposta(leadId: string, texto: string): Promise<ResultadoGerar> {
  await exigirGui();
  if (!uuid.safeParse(leadId).success) return { ok: false, erro: 'Lead não encontrado.' };
  const entrada = entradaSchema.safeParse(texto);
  if (!entrada.success) return { ok: false, erro: entrada.error.issues[0]!.message };
  try {
    return await criarSugestao(leadId, { tipo: 'resposta', texto: entrada.data });
  } catch {
    return { ok: false, erro: 'Não foi possível gerar a resposta agora.' };
  }
}

/**
 * "Gerar mensagem" sem colar nada (Fila do dia ou botão no lead): primeira abordagem para lead
 * novo, follow-up com ângulo novo para quem não respondeu. Trava em 3 tentativas.
 */
export async function gerarMensagem(leadId: string): Promise<ResultadoGerar> {
  await exigirGui();
  if (!uuid.safeParse(leadId).success) return { ok: false, erro: 'Lead não encontrado.' };
  try {
    return await criarSugestao(leadId, { tipo: 'gerada' });
  } catch {
    return { ok: false, erro: 'Não foi possível gerar a mensagem agora.' };
  }
}

/**
 * Aprovar (com ou sem edição): a resposta do lead e a sua mensagem entram no histórico, o lead
 * recebe o resumo e o follow-up do copiloto e, se a etapa mudou, o card anda com o motivo do
 * copiloto (origem "agente"). Fica registrado se você editou o texto.
 */
export async function aprovarSugestao(sugestaoId: string, texto: string): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(sugestaoId).success) return { ok: false, erro: 'Sugestão não encontrada.' };
    const final = mensagemFinalSchema.safeParse(texto);
    if (!final.success) return { ok: false, erro: final.error.issues[0]!.message };
    return obterDb().transaction(async (tx): Promise<Resultado> => {
      const [s] = await tx
        .select()
        .from(vendasSugestoes)
        .where(eq(vendasSugestoes.id, sugestaoId))
        .for('update');
      if (!s) return { ok: false, erro: 'Sugestão não encontrada.' };
      if (s.status !== 'pendente') return { ok: false, erro: 'Essa sugestão já foi decidida.' };
      const saida = saidaAgenteSchema.safeParse(s.saida);
      if (!saida.success) return { ok: false, erro: 'Sugestão inválida. Gere de novo.' };
      const [lead] = await tx
        .select({
          etapa: vendasLeads.etapa,
          naoContatar: vendasLeads.naoContatar,
          tentativas: vendasLeads.tentativas,
        })
        .from(vendasLeads)
        .where(eq(vendasLeads.id, s.leadId))
        .for('update');
      if (!lead) return { ok: false, erro: 'Lead não encontrado.' };

      const plano = planoAprovacao(lead, saida.data, s.tipo, hojeNoFuso());
      const agora = new Date();
      await tx
        .update(vendasSugestoes)
        .set({
          status: 'aprovada',
          mensagemFinal: final.data,
          editada: foiEditada(s.mensagemSugerida, final.data),
          decididoEm: agora,
        })
        .where(eq(vendasSugestoes.id, s.id));
      await tx
        .insert(vendasMensagens)
        .values({ leadId: s.leadId, autor: 'lead', texto: s.entrada });
      // um instante depois, para a ordem do histórico ficar certa
      await tx.insert(vendasMensagens).values({
        leadId: s.leadId,
        autor: 'gui',
        texto: final.data,
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
      return { ok: true, mensagem: 'Mensagem aprovada.' };
    });
  });
}

/** Descartar: a sugestão sai da tela e nada muda no lead. */
export async function descartarSugestao(sugestaoId: string): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(sugestaoId).success) return { ok: false, erro: 'Sugestão não encontrada.' };
    const r = await obterDb()
      .update(vendasSugestoes)
      .set({ status: 'descartada', decididoEm: new Date() })
      .where(and(eq(vendasSugestoes.id, sugestaoId), eq(vendasSugestoes.status, 'pendente')))
      .returning({ id: vendasSugestoes.id });
    if (!r.length) return { ok: false, erro: 'Essa sugestão já foi decidida.' };
    return { ok: true, mensagem: 'Sugestão descartada.' };
  });
}
