/**
 * Espelho Drizzle das tabelas do Vendas Orkestra.
 * Fonte da verdade: supabase/migrations (20261017000001_vendas e 20261019000001_prospeccao).
 * Mantenha em sincronia.
 */
import type { Prioridade, Segmento } from '@/domain/vendas/campos';
import type { ChaveModelo } from '@/domain/vendas/modelos';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const instante = (nome: string) => timestamp(nome, { withTimezone: true });

export const vendasEtapa = pgEnum('vendas_etapa', [
  'nao_contatado',
  'mensagem_1',
  'followup',
  'respondeu',
  'em_teste',
  'fechou',
  'sem_interesse',
]);
export const vendasAutor = pgEnum('vendas_autor', ['lead', 'gui', 'conversa']);
export const vendasOrigemMovimento = pgEnum('vendas_origem_movimento', [
  'manual',
  'agente',
  'importacao',
  'mensagem',
  'automatico',
]);
export const vendasStatusSugestao = pgEnum('vendas_status_sugestao', [
  'pendente',
  'aprovada',
  'descartada',
]);
export const vendasTipoConhecimento = pgEnum('vendas_tipo_conhecimento', [
  'produto',
  'preco',
  'objecao',
  'script',
]);
export const vendasAvaliacao = pgEnum('vendas_avaliacao', ['boa', 'ruim']);

export const vendasLeads = pgTable(
  'vendas_leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: text('nome').notNull(),
    cidade: text('cidade'),
    uf: text('uf'),
    telefone: text('telefone'),
    telefoneDigitos: text('telefone_digitos'),
    whatsapp: text('whatsapp'),
    categoria: text('categoria'),
    segmento: text('segmento').$type<Segmento>(),
    prioridade: text('prioridade').$type<Prioridade>(),
    avaliacoes: text('avaliacoes'),
    origem: text('origem'),
    dataEntrada: date('data_entrada', { mode: 'string' }).notNull(),
    etapa: vendasEtapa('etapa').notNull().default('nao_contatado'),
    resumo: text('resumo'),
    observacoes: text('observacoes'),
    proximoFollowup: date('proximo_followup', { mode: 'string' }),
    ultimoModelo: text('ultimo_modelo').$type<ChaveModelo>(),
    naoContatar: boolean('nao_contatar').notNull().default(false),
    naoContatarEm: instante('nao_contatar_em'),
    criadoEm: instante('criado_em').notNull().defaultNow(),
    atualizadoEm: instante('atualizado_em').notNull().defaultNow(),
  },
  (t) => [index('vendas_leads_etapa_idx').on(t.etapa, t.atualizadoEm)],
);

export const vendasSugestoes = pgTable(
  'vendas_sugestoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => vendasLeads.id, { onDelete: 'cascade' }),
    entrada: text('entrada').notNull(),
    saida: jsonb('saida').notNull(),
    mensagemSugerida: text('mensagem_sugerida').notNull(),
    mensagemFinal: text('mensagem_final'),
    editada: boolean('editada').notNull().default(false),
    status: vendasStatusSugestao('status').notNull().default('pendente'),
    tipo: text('tipo').$type<'resposta' | 'abordagem' | 'followup'>().notNull().default('resposta'),
    promptVersao: text('prompt_versao').notNull(),
    provedor: text('provedor').notNull(),
    modelo: text('modelo').notNull(),
    exemplosUsados: jsonb('exemplos_usados').notNull().default([]),
    /** O que o Gui decidiu: { etapa, proximoFollowup }. */
    final: jsonb('final'),
    criadoEm: instante('criado_em').notNull().defaultNow(),
    decididoEm: instante('decidido_em'),
  },
  (t) => [index('vendas_sugestoes_lead_idx').on(t.leadId, t.criadoEm)],
);

export const vendasMensagens = pgTable(
  'vendas_mensagens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => vendasLeads.id, { onDelete: 'cascade' }),
    autor: vendasAutor('autor').notNull(),
    texto: text('texto').notNull(),
    sugestaoId: uuid('sugestao_id').references(() => vendasSugestoes.id, { onDelete: 'set null' }),
    criadoEm: instante('criado_em').notNull().defaultNow(),
  },
  (t) => [
    index('vendas_mensagens_lead_idx').on(t.leadId, t.criadoEm),
    index('vendas_mensagens_sugestao_idx').on(t.sugestaoId),
  ],
);

export const vendasMovimentos = pgTable(
  'vendas_movimentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => vendasLeads.id, { onDelete: 'cascade' }),
    de: vendasEtapa('de'),
    para: vendasEtapa('para').notNull(),
    origem: vendasOrigemMovimento('origem').notNull(),
    motivo: text('motivo'),
    sugestaoId: uuid('sugestao_id').references(() => vendasSugestoes.id, { onDelete: 'set null' }),
    criadoEm: instante('criado_em').notNull().defaultNow(),
  },
  (t) => [
    index('vendas_movimentos_lead_idx').on(t.leadId, t.criadoEm),
    index('vendas_movimentos_sugestao_idx').on(t.sugestaoId),
  ],
);

export const vendasConhecimento = pgTable('vendas_conhecimento', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipo: vendasTipoConhecimento('tipo').notNull(),
  titulo: text('titulo').notNull(),
  conteudo: text('conteudo').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  ordem: integer('ordem').notNull().default(0),
  criadoEm: instante('criado_em').notNull().defaultNow(),
  atualizadoEm: instante('atualizado_em').notNull().defaultNow(),
});

export const vendasExemplos = pgTable(
  'vendas_exemplos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sugestaoId: uuid('sugestao_id')
      .notNull()
      .unique()
      .references(() => vendasSugestoes.id, { onDelete: 'cascade' }),
    avaliacao: vendasAvaliacao('avaliacao').notNull(),
    motivo: text('motivo').notNull(),
    criadoEm: instante('criado_em').notNull().defaultNow(),
  },
  (t) => [index('vendas_exemplos_avaliacao_idx').on(t.avaliacao, t.criadoEm)],
);

export const vendasModelos = pgTable('vendas_modelos', {
  chave: text('chave').$type<ChaveModelo>().primaryKey(),
  texto: text('texto').notNull(),
  atualizadoEm: instante('atualizado_em').notNull().defaultNow(),
});

export const vendasAjustes = pgTable('vendas_ajustes', {
  id: boolean('id').primaryKey().default(true),
  metaDiaria: smallint('meta_diaria').notNull().default(10),
  inicioMetas: date('inicio_metas', { mode: 'string' }).notNull(),
  atualizadoEm: instante('atualizado_em').notNull().defaultNow(),
});
