'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { conhecimentoSchema, type ConhecimentoEntrada } from '@/domain/vendas/conhecimento';
import { obterDb } from '@/server/db/client';
import { vendasConhecimento } from '@/server/db/schema';
import { acao, camposDoZod, INVALIDO, type Resultado } from './comum';

/* Base de conhecimento: o que o copiloto pode afirmar. */

const uuid = z.uuid();
const NAO_ACHOU = 'Item não encontrado.';

export async function criarConhecimento(
  entrada: ConhecimentoEntrada,
): Promise<Resultado<{ id: string }>> {
  return acao(async () => {
    const v = conhecimentoSchema.safeParse(entrada);
    if (!v.success) return { ok: false, erro: INVALIDO, campos: camposDoZod(v.error) };
    const [item] = await obterDb()
      .insert(vendasConhecimento)
      .values(v.data)
      .returning({ id: vendasConhecimento.id });
    return { ok: true, mensagem: 'Item adicionado.', dados: { id: item!.id } };
  });
}

export async function atualizarConhecimento(
  id: string,
  entrada: ConhecimentoEntrada,
): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(id).success) return { ok: false, erro: NAO_ACHOU };
    const v = conhecimentoSchema.safeParse(entrada);
    if (!v.success) return { ok: false, erro: INVALIDO, campos: camposDoZod(v.error) };
    const r = await obterDb()
      .update(vendasConhecimento)
      .set(v.data)
      .where(eq(vendasConhecimento.id, id))
      .returning({ id: vendasConhecimento.id });
    return r.length ? { ok: true, mensagem: 'Item salvo.' } : { ok: false, erro: NAO_ACHOU };
  });
}

/** Desativar tira o item do que o copiloto sabe, sem apagar (dá para reativar). */
export async function definirAtivo(id: string, ativo: boolean): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(id).success) return { ok: false, erro: NAO_ACHOU };
    const r = await obterDb()
      .update(vendasConhecimento)
      .set({ ativo: ativo === true })
      .where(eq(vendasConhecimento.id, id))
      .returning({ id: vendasConhecimento.id });
    if (!r.length) return { ok: false, erro: NAO_ACHOU };
    return { ok: true, mensagem: ativo ? 'Item reativado.' : 'Item desativado.' };
  });
}

export async function excluirConhecimento(id: string): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(id).success) return { ok: false, erro: NAO_ACHOU };
    const r = await obterDb()
      .delete(vendasConhecimento)
      .where(eq(vendasConhecimento.id, id))
      .returning({ id: vendasConhecimento.id });
    return r.length ? { ok: true, mensagem: 'Item excluído.' } : { ok: false, erro: NAO_ACHOU };
  });
}
