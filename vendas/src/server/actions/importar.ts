'use server';

import { inArray } from 'drizzle-orm';
import { formatPhoneBR } from '@/domain/phone';
import { lerCsvLeads } from '@/domain/vendas/csv';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMovimentos } from '@/server/db/schema';
import { acao, type Resultado } from './comum';

/* Importação de leads por CSV: prévia (nada é gravado) e importação. */

export type LinhaPrevia = {
  linha: number;
  situacao: 'nova' | 'invalida' | 'repetida' | 'ja_cadastrada';
  nome: string;
  buffet: string | null;
  telefone: string | null;
  cidade: string | null;
  erro: string | null;
};

export type PreviaImportacao = { colunas: string[]; linhas: LinhaPrevia[]; novas: number };

const MOTIVO_IMPORTACAO = 'Importação CSV';

/** Lê o CSV no servidor e marca o que já existe no banco (mesmo telefone). */
async function montarPrevia(texto: string): Promise<Resultado<PreviaImportacao>> {
  const leitura = lerCsvLeads(texto);
  if (!leitura.ok) return { ok: false, erro: leitura.erro };
  const telefones = leitura.linhas.flatMap((l) =>
    l.situacao !== 'invalida' && l.dados.telefone ? [l.dados.telefone] : [],
  );
  const existentes = new Set(
    telefones.length
      ? (
          await obterDb()
            .select({ t: vendasLeads.telefoneE164 })
            .from(vendasLeads)
            .where(inArray(vendasLeads.telefoneE164, telefones))
        ).map((r) => r.t)
      : [],
  );
  const linhas = leitura.linhas.map((l): LinhaPrevia => {
    if (l.situacao === 'invalida') {
      return {
        linha: l.linha,
        situacao: 'invalida',
        nome: l.nome,
        buffet: null,
        telefone: null,
        cidade: null,
        erro: l.erro,
      };
    }
    const d = l.dados;
    const situacao =
      l.situacao === 'repetida'
        ? 'repetida'
        : d.telefone && existentes.has(d.telefone)
          ? 'ja_cadastrada'
          : 'nova';
    return {
      linha: l.linha,
      situacao,
      nome: d.nome,
      buffet: d.buffet,
      telefone: d.telefone ? formatPhoneBR(d.telefone) : null,
      cidade: d.cidade,
      erro: null,
    };
  });
  return {
    ok: true,
    mensagem: '',
    dados: {
      colunas: leitura.colunas,
      linhas,
      novas: linhas.filter((l) => l.situacao === 'nova').length,
    },
  };
}

/** Prévia da importação: nada é gravado. */
export async function previsualizarImportacao(texto: string): Promise<Resultado<PreviaImportacao>> {
  return acao(async () => montarPrevia(String(texto ?? '')));
}

/**
 * Grava as linhas novas (lê o CSV de novo; nunca confia na prévia do navegador). Telefone que
 * já existe é ignorado também no banco (ON CONFLICT), então duas importações seguidas não
 * duplicam. Cada lead entra em Novo com o movimento "Importação CSV".
 */
export async function importarLeads(
  texto: string,
): Promise<Resultado<{ importados: number; ignorados: number }>> {
  return acao(async () => {
    const leitura = lerCsvLeads(String(texto ?? ''));
    if (!leitura.ok) return { ok: false, erro: leitura.erro };
    const validas = leitura.linhas.flatMap((l) => (l.situacao === 'ok' ? [l.dados] : []));
    if (validas.length === 0) return { ok: false, erro: 'Nenhuma linha nova para importar.' };
    const importados = await obterDb().transaction(async (tx) => {
      const ids = await tx
        .insert(vendasLeads)
        .values(
          validas.map((d) => ({
            nome: d.nome,
            buffet: d.buffet,
            telefoneE164: d.telefone,
            cidade: d.cidade,
            origem: d.origem,
            resumo: d.resumo,
          })),
        )
        .onConflictDoNothing()
        .returning({ id: vendasLeads.id });
      if (ids.length) {
        await tx.insert(vendasMovimentos).values(
          ids.map(({ id }) => ({
            leadId: id,
            de: null,
            para: 'novo' as const,
            origem: 'importacao' as const,
            motivo: MOTIVO_IMPORTACAO,
          })),
        );
      }
      return ids.length;
    });
    const ignorados = leitura.linhas.length - importados;
    return {
      ok: true,
      mensagem: importados === 1 ? '1 lead importado.' : `${importados} leads importados.`,
      dados: { importados, ignorados },
    };
  });
}
