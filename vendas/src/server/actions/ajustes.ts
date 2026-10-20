'use server';

import { z } from 'zod';
import { dataCivil } from '@/domain/validacao';
import { obterDb } from '@/server/db/client';
import { vendasAjustes } from '@/server/db/schema';
import { acao, camposDoZod, INVALIDO, type Resultado } from './comum';

const ajustesSchema = z.object({
  metaDiaria: z.coerce
    .number({ error: 'Informe a meta.' })
    .int('Use um número inteiro.')
    .min(1, 'A meta precisa ser pelo menos 1.')
    .max(200, 'Use no máximo 200.'),
  inicioMetas: dataCivil,
});

/** Meta de abordagens por dia e a data de início das metas de venda. */
export async function salvarAjustes(entrada: {
  metaDiaria: string | number;
  inicioMetas: string;
}): Promise<Resultado> {
  return acao(async () => {
    const v = ajustesSchema.safeParse(entrada);
    if (!v.success) return { ok: false, erro: INVALIDO, campos: camposDoZod(v.error) };
    await obterDb()
      .insert(vendasAjustes)
      .values({ id: true, ...v.data })
      .onConflictDoUpdate({ target: vendasAjustes.id, set: v.data });
    return { ok: true, mensagem: 'Metas salvas.' };
  });
}
