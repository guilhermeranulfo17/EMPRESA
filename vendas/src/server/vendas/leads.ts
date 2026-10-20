import 'server-only';
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  ne,
  notInArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { SEGMENTOS, type Prioridade, type Segmento } from '@/domain/vendas/campos';
import { ehEtapa, ETAPAS_ENCERRADAS, type EtapaVendas } from '@/domain/vendas/etapas';
import { deveEncerrar, MOTIVO_ENCERRAMENTO } from '@/domain/vendas/modelos';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMovimentos } from '@/server/db/schema';

/* Leituras dos leads. Conexão do servidor: só depois de exigirGui(). */

export type LeadVendas = typeof vendasLeads.$inferSelect;

export type FiltrosLeads = {
  busca: string | null;
  cidade: string | null;
  prioridade: Prioridade | 'sem' | null;
  segmento: Segmento | 'sem' | null;
  etapa: EtapaVendas | null;
};

export const SEM_FILTRO: FiltrosLeads = {
  busca: null,
  cidade: null,
  prioridade: null,
  segmento: null,
  etapa: null,
};

/** Cidade do filtro: "Uberlândia|MG" (ou "|" para sem cidade). */
function condicaoCidade(valor: string): SQL | undefined {
  const [cidade, uf] = valor.split('|');
  const c = cidade ? eq(vendasLeads.cidade, cidade) : sql`${vendasLeads.cidade} is null`;
  return and(c, uf ? eq(vendasLeads.uf, uf) : sql`${vendasLeads.uf} is null`);
}

function condicoes(f: FiltrosLeads): SQL | undefined {
  const lista: (SQL | undefined)[] = [];
  if (f.etapa) lista.push(eq(vendasLeads.etapa, f.etapa));
  if (f.prioridade === 'sem') lista.push(sql`${vendasLeads.prioridade} is null`);
  else if (f.prioridade) lista.push(eq(vendasLeads.prioridade, f.prioridade));
  if (f.segmento === 'sem') lista.push(sql`${vendasLeads.segmento} is null`);
  else if (f.segmento) lista.push(eq(vendasLeads.segmento, f.segmento));
  if (f.cidade) lista.push(condicaoCidade(f.cidade));
  const termo = f.busca?.trim();
  if (termo) {
    const digitos = termo.replace(/\D/g, '');
    const like = `%${termo.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    lista.push(
      or(
        sql`extensions.unaccent(${vendasLeads.nome}) ilike extensions.unaccent(${like})`,
        ilike(vendasLeads.categoria, like),
        ...(digitos.length >= 4 ? [ilike(vendasLeads.telefoneDigitos, `%${digitos}%`)] : []),
      ),
    );
  }
  return lista.length ? and(...lista) : undefined;
}

export type ResultadoLista = { leads: LeadVendas[]; total: number };

/** Lista com filtros: mais recentes primeiro (atualizados por último). */
export async function listarLeads(f: FiltrosLeads, limite: number): Promise<ResultadoLista> {
  const db = obterDb();
  const onde = condicoes(f);
  const [leads, [conta]] = await Promise.all([
    db.select().from(vendasLeads).where(onde).orderBy(desc(vendasLeads.atualizadoEm)).limit(limite),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(vendasLeads)
      .where(onde),
  ]);
  return { leads, total: conta?.n ?? 0 };
}

export type OpcaoCidade = {
  valor: string;
  cidade: string | null;
  uf: string | null;
  total: number;
};

/** Cidades que existem nos leads (para o filtro), da que tem mais leads para a que tem menos. */
export async function listarCidades(): Promise<OpcaoCidade[]> {
  const linhas = await obterDb()
    .select({ cidade: vendasLeads.cidade, uf: vendasLeads.uf, total: sql<number>`count(*)::int` })
    .from(vendasLeads)
    .groupBy(vendasLeads.cidade, vendasLeads.uf)
    .orderBy(desc(sql`count(*)`), asc(vendasLeads.cidade));
  return linhas.map((l) => ({ ...l, valor: `${l.cidade ?? ''}|${l.uf ?? ''}` }));
}

export async function carregarLead(id: string): Promise<LeadVendas | null> {
  const [l] = await obterDb().select().from(vendasLeads).where(eq(vendasLeads.id, id)).limit(1);
  return l ?? null;
}

/** Cards do funil (todas as etapas), mais recentes primeiro em cada coluna. */
export async function listarPipeline(f: FiltrosLeads) {
  return obterDb()
    .select({
      id: vendasLeads.id,
      nome: vendasLeads.nome,
      cidade: vendasLeads.cidade,
      uf: vendasLeads.uf,
      prioridade: vendasLeads.prioridade,
      etapa: vendasLeads.etapa,
      proximoFollowup: vendasLeads.proximoFollowup,
      naoContatar: vendasLeads.naoContatar,
    })
    .from(vendasLeads)
    .where(condicoes(f))
    .orderBy(desc(vendasLeads.atualizadoEm))
    .limit(3000);
}

export type MovimentoLead = {
  id: string;
  de: EtapaVendas | null;
  para: EtapaVendas;
  origem: (typeof vendasMovimentos.$inferSelect)['origem'];
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

/** Leads que podem aparecer no HOJE (não contatados e follow-ups em aberto). */
export async function listarLeadsHoje(hoje: string) {
  return obterDb()
    .select()
    .from(vendasLeads)
    .where(
      and(
        eq(vendasLeads.naoContatar, false),
        or(
          eq(vendasLeads.etapa, 'nao_contatado'),
          and(
            notInArray(vendasLeads.etapa, [...ETAPAS_ENCERRADAS]),
            isNotNull(vendasLeads.proximoFollowup),
            sql`${vendasLeads.proximoFollowup} <= ${hoje}`,
          ),
        ),
      ),
    );
}

/** Abordagens de hoje: leads diferentes que entraram em "Mensagem 1 enviada" hoje (sem importação). */
export async function contarAbordagens(desde: Date): Promise<number> {
  const [r] = await obterDb()
    .select({ n: sql<number>`count(distinct ${vendasMovimentos.leadId})::int` })
    .from(vendasMovimentos)
    .where(
      and(
        eq(vendasMovimentos.para, 'mensagem_1'),
        ne(vendasMovimentos.origem, 'importacao'),
        gte(vendasMovimentos.criadoEm, desde),
      ),
    );
  return r?.n ?? 0;
}

/**
 * Quem recebeu o Follow-up D+5 e chegou ao prazo final sem responder vai para "Sem interesse".
 * Roda quando o HOJE, a lista ou o painel abrem (não precisa de agendador). Devolve quantos.
 */
export async function encerrarSemResposta(hoje: string): Promise<number> {
  const db = obterDb();
  const candidatos = await db
    .select({
      id: vendasLeads.id,
      etapa: vendasLeads.etapa,
      ultimoModelo: vendasLeads.ultimoModelo,
      proximoFollowup: vendasLeads.proximoFollowup,
    })
    .from(vendasLeads)
    .where(
      and(
        eq(vendasLeads.etapa, 'followup'),
        eq(vendasLeads.ultimoModelo, 'followup_5'),
        sql`${vendasLeads.proximoFollowup} <= ${hoje}`,
      ),
    );
  const ids = candidatos.filter((c) => deveEncerrar(c, hoje)).map((c) => c.id);
  if (!ids.length) return 0;
  return db.transaction(async (tx) => {
    // de novo dentro da transação: só quem ainda está no mesmo ponto
    const movidos = await tx
      .update(vendasLeads)
      .set({ etapa: 'sem_interesse', proximoFollowup: null })
      .where(
        and(
          inArray(vendasLeads.id, ids),
          eq(vendasLeads.etapa, 'followup'),
          eq(vendasLeads.ultimoModelo, 'followup_5'),
        ),
      )
      .returning({ id: vendasLeads.id });
    if (movidos.length) {
      await tx.insert(vendasMovimentos).values(
        movidos.map(({ id }) => ({
          leadId: id,
          de: 'followup' as const,
          para: 'sem_interesse' as const,
          origem: 'automatico' as const,
          motivo: MOTIVO_ENCERRAMENTO,
        })),
      );
    }
    return movidos.length;
  });
}

/** Tudo o que o painel precisa: etapa e cidade de cada lead e os movimentos. */
export async function dadosPainel() {
  const db = obterDb();
  const [leads, movimentos] = await Promise.all([
    db
      .select({
        id: vendasLeads.id,
        etapa: vendasLeads.etapa,
        cidade: vendasLeads.cidade,
        uf: vendasLeads.uf,
      })
      .from(vendasLeads),
    db
      .select({
        leadId: vendasMovimentos.leadId,
        para: vendasMovimentos.para,
        origem: vendasMovimentos.origem,
        criadoEm: vendasMovimentos.criadoEm,
      })
      .from(vendasMovimentos),
  ]);
  return { leads, movimentos };
}

type Params = Record<string, string | string[] | undefined>;
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || null;

/** Filtros a partir da URL (valor desconhecido é ignorado). */
export function lerFiltros(params: Params): FiltrosLeads {
  const prioridade = um(params.prioridade);
  const segmento = um(params.segmento);
  const etapa = um(params.etapa);
  const cidade = um(params.cidade);
  return {
    busca: um(params.q)?.slice(0, 100) ?? null,
    cidade: cidade && cidade.includes('|') ? cidade.slice(0, 200) : null,
    prioridade:
      prioridade && ['A', 'B', 'C', 'sem'].includes(prioridade)
        ? (prioridade as FiltrosLeads['prioridade'])
        : null,
    segmento:
      segmento && [...SEGMENTOS, 'sem'].includes(segmento as Segmento)
        ? (segmento as FiltrosLeads['segmento'])
        : null,
    etapa: ehEtapa(etapa) ? etapa : null,
  };
}
