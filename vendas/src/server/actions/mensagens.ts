'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { hojeNoFuso } from '@/domain/dates';
import { CHAVES_MODELO, ehChaveModelo, planoEnvio } from '@/domain/vendas/modelos';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMensagens, vendasModelos, vendasMovimentos } from '@/server/db/schema';
import { acao, camposDoZod, INVALIDO, type Resultado } from './comum';

const uuid = z.uuid();

const modeloSchema = z.object({
  chave: z.enum(CHAVES_MODELO),
  texto: z
    .string()
    .trim()
    .min(1, 'O modelo não pode ficar vazio.')
    .max(2000, 'Use no máximo 2.000 caracteres.'),
});

const textoEnvioSchema = z
  .string()
  .trim()
  .min(1, 'A mensagem não pode ficar vazia.')
  .max(4000, 'Mensagem longa demais.');

/** Salva o texto de um modelo de mensagem. */
export async function salvarModelo(chave: string, texto: string): Promise<Resultado> {
  return acao(async () => {
    const v = modeloSchema.safeParse({ chave, texto });
    if (!v.success) return { ok: false, erro: INVALIDO, campos: camposDoZod(v.error) };
    await obterDb()
      .insert(vendasModelos)
      .values({ chave: v.data.chave, texto: v.data.texto })
      .onConflictDoUpdate({ target: vendasModelos.chave, set: { texto: v.data.texto } });
    return { ok: true, mensagem: 'Modelo salvo.' };
  });
}

/**
 * O Gui tocou em "Abrir no WhatsApp" (ou "Copiar e marcar enviada"): a mensagem entra no
 * histórico do lead, a etapa anda e o próximo follow-up fica agendado conforme a cadência.
 */
export async function registrarEnvio(
  leadId: string,
  chave: string,
  texto: string,
): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(leadId).success) return { ok: false, erro: 'Lead não encontrado.' };
    if (!ehChaveModelo(chave)) return { ok: false, erro: 'Modelo inválido.' };
    const t = textoEnvioSchema.safeParse(texto);
    if (!t.success) return { ok: false, erro: t.error.issues[0]!.message };
    return obterDb().transaction(async (tx): Promise<Resultado> => {
      const [lead] = await tx
        .select({ etapa: vendasLeads.etapa, ultimoModelo: vendasLeads.ultimoModelo })
        .from(vendasLeads)
        .where(eq(vendasLeads.id, leadId))
        .for('update');
      if (!lead) return { ok: false, erro: 'Lead não encontrado.' };
      const plano = planoEnvio(lead, chave, hojeNoFuso());
      await tx
        .update(vendasLeads)
        .set({ etapa: plano.etapa, proximoFollowup: plano.proximoFollowup, ultimoModelo: chave })
        .where(eq(vendasLeads.id, leadId));
      await tx.insert(vendasMensagens).values({ leadId, autor: 'gui', texto: t.data });
      if (plano.etapa !== lead.etapa) {
        await tx.insert(vendasMovimentos).values({
          leadId,
          de: lead.etapa,
          para: plano.etapa,
          origem: 'mensagem',
          motivo: plano.motivo,
        });
      }
      return { ok: true, mensagem: 'Mensagem registrada.' };
    });
  });
}
