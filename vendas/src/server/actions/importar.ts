'use server';

import { inArray } from 'drizzle-orm';
import { hojeNoFuso } from '@/domain/dates';
import { ETAPAS_SEM_RESPOSTA } from '@/domain/vendas/etapas';
import { lerPlanilha, type LinhaImportacao } from '@/domain/vendas/planilha';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMovimentos } from '@/server/db/schema';
import { lerDaPasta, lerLinhas } from '@/server/vendas/arquivos';
import { acao, type Resultado } from './comum';

/*
 * Importação da lista de prospecção (CSV ou XLSX): prévia (nada é gravado) e gravação. O
 * arquivo vem pelo upload (campo "arquivo") ou da pasta import/ (campo "pasta" com o nome).
 */

export type LinhaPrevia = {
  linha: number;
  situacao: 'nova' | 'invalida' | 'repetida' | 'ja_cadastrada';
  nome: string;
  telefone: string | null;
  cidade: string | null;
  prioridade: string | null;
  erro: string | null;
  avisos: string[];
};

export type PreviaImportacao = {
  arquivo: string;
  linhas: LinhaPrevia[];
  novas: number;
  repetidas: number;
  jaCadastradas: number;
  invalidas: number;
};

async function abrir(
  form: FormData,
): Promise<{ ok: true; nome: string; linhas: LinhaImportacao[] } | { ok: false; erro: string }> {
  const arquivo = form.get('arquivo');
  const pasta = form.get('pasta');
  let nome: string;
  let bytes: Uint8Array | null;
  if (arquivo instanceof File && arquivo.size > 0) {
    nome = arquivo.name;
    bytes = new Uint8Array(await arquivo.arrayBuffer());
  } else if (typeof pasta === 'string' && pasta) {
    nome = pasta;
    bytes = await lerDaPasta(pasta);
    if (!bytes) return { ok: false, erro: 'Arquivo não encontrado na pasta import.' };
  } else {
    return { ok: false, erro: 'Escolha um arquivo CSV ou XLSX.' };
  }
  const leitura = lerLinhas(nome, bytes);
  if (!leitura.ok) return leitura;
  const planilha = lerPlanilha(leitura.linhas);
  if (!planilha.ok) return planilha;
  return { ok: true, nome, linhas: planilha.linhas };
}

/** Telefones (dígitos) das linhas que já existem no banco. */
async function jaCadastrados(linhas: LinhaImportacao[]): Promise<Set<string>> {
  const digitos = linhas.flatMap((l) => (l.dados ? [l.dados.telefoneDigitos] : []));
  if (!digitos.length) return new Set();
  const achados = await obterDb()
    .select({ d: vendasLeads.telefoneDigitos })
    .from(vendasLeads)
    .where(inArray(vendasLeads.telefoneDigitos, digitos));
  return new Set(achados.map((a) => a.d!));
}

/** Prévia: quantos novos, quantos duplicados (no arquivo ou já cadastrados) e quantos com erro. */
export async function previsualizarImportacao(
  form: FormData,
): Promise<Resultado<PreviaImportacao>> {
  return acao(async () => {
    const a = await abrir(form);
    if (!a.ok) return a;
    const existentes = await jaCadastrados(a.linhas);
    const linhas = a.linhas.map((l): LinhaPrevia => {
      const situacao =
        l.situacao === 'invalida'
          ? 'invalida'
          : l.situacao === 'repetida'
            ? 'repetida'
            : existentes.has(l.dados!.telefoneDigitos)
              ? 'ja_cadastrada'
              : 'nova';
      return {
        linha: l.linha,
        situacao,
        nome: l.nome,
        telefone: l.dados?.telefone ?? null,
        cidade: l.dados ? [l.dados.cidade, l.dados.uf].filter(Boolean).join('/') || null : null,
        prioridade: l.dados?.prioridade ?? null,
        erro: l.erro,
        avisos: l.avisos,
      };
    });
    const conta = (s: LinhaPrevia['situacao']) => linhas.filter((l) => l.situacao === s).length;
    return {
      ok: true,
      mensagem: '',
      dados: {
        arquivo: a.nome,
        linhas,
        novas: conta('nova'),
        repetidas: conta('repetida'),
        jaCadastradas: conta('ja_cadastrada'),
        invalidas: conta('invalida'),
      },
    };
  });
}

/**
 * Grava só as linhas novas (lê o arquivo de novo; nunca confia na prévia do navegador). Telefone
 * que já existe é ignorado também no banco (ON CONFLICT), então importar duas vezes não duplica.
 * Quem já vem com mensagem enviada entra com follow-up para hoje, para aparecer no HOJE.
 */
export async function importarLeads(
  form: FormData,
): Promise<Resultado<{ importados: number; ignorados: number }>> {
  return acao(async () => {
    const a = await abrir(form);
    if (!a.ok) return a;
    const validas = a.linhas.flatMap((l) => (l.situacao === 'ok' && l.dados ? [l.dados] : []));
    if (!validas.length) return { ok: false, erro: 'Nenhuma linha nova para importar.' };
    const hoje = hojeNoFuso();
    const importados = await obterDb().transaction(async (tx) => {
      const inseridos = await tx
        .insert(vendasLeads)
        .values(
          validas.map((d) => ({
            nome: d.nome,
            cidade: d.cidade,
            uf: d.uf,
            telefone: d.telefone,
            telefoneDigitos: d.telefoneDigitos,
            whatsapp: d.whatsapp,
            categoria: d.categoria,
            segmento: d.segmento,
            prioridade: d.prioridade,
            avaliacoes: d.avaliacoes,
            origem: d.origem,
            etapa: d.etapa,
            observacoes: d.observacoes,
            dataEntrada: hoje,
            proximoFollowup:
              ETAPAS_SEM_RESPOSTA.includes(d.etapa) || d.etapa === 'respondeu' ? hoje : null,
          })),
        )
        .onConflictDoNothing()
        .returning({ id: vendasLeads.id, etapa: vendasLeads.etapa });
      if (inseridos.length) {
        await tx.insert(vendasMovimentos).values(
          inseridos.map(({ id, etapa }) => ({
            leadId: id,
            de: null,
            para: etapa,
            origem: 'importacao' as const,
            motivo: `Importação: ${a.nome}`.slice(0, 500),
          })),
        );
      }
      return inseridos.length;
    });
    const ignorados = a.linhas.length - importados;
    return {
      ok: true,
      mensagem: importados === 1 ? '1 lead importado.' : `${importados} leads importados.`,
      dados: { importados, ignorados },
    };
  });
}
