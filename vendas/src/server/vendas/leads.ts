import 'server-only';
import { and, desc, eq, notInArray } from 'drizzle-orm';
import { formatPhoneBR } from '@/domain/phone';
import type { EtapaVendas } from '@/domain/vendas/etapas';
import { normalizarBusca } from '@/domain/vendas/lead';
import type { CardPipeline } from '@/domain/vendas/pipeline';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMovimentos } from '@/server/db/schema';

/* Leituras dos leads. Conexão do servidor: só depois de exigirGui(). */

export type LeadVendasResumo = {
  id: string;
  nome: string;
  buffet: string | null;
  cidade: string | null;
  telefone: string | null;
  etapa: EtapaVendas;
  proximoFollowup: string | null;
  naoContatar: boolean;
};

export type LeadVendasDetalhe = LeadVendasResumo & {
  telefoneE164: string | null;
  origem: string | null;
  resumo: string | null;
  tentativas: number;
  criadoEm: Date;
  atualizadoEm: Date;
};

/** Limite da lista: a prospecção do Gui tem centenas de leads, não milhares. */
const LIMITE_LISTA = 1000;

/** Lista de leads, mais recentes primeiro; a busca casa nome, buffet, cidade ou telefone. */
export async function listarLeadsVendas(busca: string | null): Promise<LeadVendasResumo[]> {
  const linhas = await obterDb()
    .select()
    .from(vendasLeads)
    .orderBy(desc(vendasLeads.atualizadoEm))
    .limit(LIMITE_LISTA);
  const termo = busca ? normalizarBusca(busca) : '';
  const digitos = termo.replace(/\D/g, '');
  return linhas
    .filter((l) => {
      if (!termo) return true;
      const texto = normalizarBusca([l.nome, l.buffet, l.cidade].filter(Boolean).join(' '));
      return texto.includes(termo) || (digitos.length >= 4 && !!l.telefoneE164?.includes(digitos));
    })
    .map(resumo);
}

export async function carregarLeadVendas(id: string): Promise<LeadVendasDetalhe | null> {
  const [l] = await obterDb().select().from(vendasLeads).where(eq(vendasLeads.id, id)).limit(1);
  if (!l) return null;
  return {
    ...resumo(l),
    telefoneE164: l.telefoneE164,
    origem: l.origem,
    resumo: l.resumo,
    tentativas: l.tentativas,
    criadoEm: l.criadoEm,
    atualizadoEm: l.atualizadoEm,
  };
}

function resumo(l: typeof vendasLeads.$inferSelect): LeadVendasResumo {
  return {
    id: l.id,
    nome: l.nome,
    buffet: l.buffet,
    cidade: l.cidade,
    telefone: l.telefoneE164 ? formatPhoneBR(l.telefoneE164) : null,
    etapa: l.etapa,
    proximoFollowup: l.proximoFollowup,
    naoContatar: l.naoContatar,
  };
}

/** Cards do pipeline (todas as etapas), mais recentes primeiro em cada coluna. */
export async function listarPipeline(): Promise<CardPipeline[]> {
  const linhas = await obterDb()
    .select({
      id: vendasLeads.id,
      nome: vendasLeads.nome,
      buffet: vendasLeads.buffet,
      cidade: vendasLeads.cidade,
      etapa: vendasLeads.etapa,
      proximoFollowup: vendasLeads.proximoFollowup,
      naoContatar: vendasLeads.naoContatar,
    })
    .from(vendasLeads)
    .orderBy(desc(vendasLeads.atualizadoEm))
    .limit(LIMITE_LISTA);
  return linhas;
}

export type MovimentoLead = {
  id: string;
  de: EtapaVendas | null;
  para: EtapaVendas;
  origem: 'manual' | 'agente' | 'importacao';
  motivo: string | null;
  criadoEm: Date;
};

/** Histórico de etapas do lead, do mais recente para o mais antigo. */
export async function listarMovimentos(leadId: string): Promise<MovimentoLead[]> {
  return obterDb()
    .select({
      id: vendasMovimentos.id,
      de: vendasMovimentos.de,
      para: vendasMovimentos.para,
      origem: vendasMovimentos.origem,
      motivo: vendasMovimentos.motivo,
      criadoEm: vendasMovimentos.criadoEm,
    })
    .from(vendasMovimentos)
    .where(eq(vendasMovimentos.leadId, leadId))
    .orderBy(desc(vendasMovimentos.criadoEm));
}

/** Leads que podem entrar na Fila do dia (o domínio decide quem entra e em que ordem). */
export async function listarLeadsFila() {
  return obterDb()
    .select({
      id: vendasLeads.id,
      nome: vendasLeads.nome,
      buffet: vendasLeads.buffet,
      cidade: vendasLeads.cidade,
      etapa: vendasLeads.etapa,
      resumo: vendasLeads.resumo,
      proximoFollowup: vendasLeads.proximoFollowup,
      tentativas: vendasLeads.tentativas,
      naoContatar: vendasLeads.naoContatar,
      telefoneE164: vendasLeads.telefoneE164,
      criadoEm: vendasLeads.criadoEm,
    })
    .from(vendasLeads)
    .where(
      and(
        eq(vendasLeads.naoContatar, false),
        notInArray(vendasLeads.etapa, ['cliente', 'perdido']),
      ),
    )
    .limit(LIMITE_LISTA);
}
