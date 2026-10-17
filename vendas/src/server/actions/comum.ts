import 'server-only';
import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import type { z } from 'zod';
import { exigirGui } from '@/server/guard';

/* Peças comuns das server actions (fora de 'use server' para não virarem endpoints). */

export type Resultado<T = undefined> =
  | { ok: true; mensagem: string; dados?: T }
  | { ok: false; erro: string; campos?: Record<string, string> };

export const PADRAO = 'Não foi possível concluir agora.';
export const INVALIDO = 'Confira os campos destacados.';
const TELEFONE_REPETIDO = 'Já existe um lead com esse telefone.';

export function camposDoZod(erro: z.ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const i of erro.issues) campos[i.path.join('.') || '_'] ??= i.message;
  return campos;
}

function telefoneRepetido(erro: unknown): boolean {
  const e = erro as { code?: string; cause?: { code?: string } } | null;
  return (e?.code ?? e?.cause?.code) === '23505';
}

/** Roda a ação com o login conferido; erro do banco vira mensagem simples. */
export async function acao<T>(fn: () => Promise<Resultado<T>>): Promise<Resultado<T>> {
  try {
    await exigirGui();
    const r = await fn();
    if (r.ok) revalidatePath('/', 'layout');
    return r;
  } catch (erro) {
    unstable_rethrow(erro);
    if (telefoneRepetido(erro)) {
      return { ok: false, erro: TELEFONE_REPETIDO, campos: { telefone: TELEFONE_REPETIDO } };
    }
    return { ok: false, erro: PADRAO };
  }
}
