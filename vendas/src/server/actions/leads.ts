'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { hojeNoFuso } from '@/domain/dates';
import {
  leadVendasSchema,
  type LeadVendasDados,
  type LeadVendasEntrada,
} from '@/domain/vendas/lead';
import { obterDb } from '@/server/db/client';
import { vendasLeads, vendasMovimentos } from '@/server/db/schema';
import { acao, camposDoZod, INVALIDO, type Resultado } from './comum';

/* Ações dos leads. Toda ação exige o Gui logado e valida com o schema do domínio. */

const uuid = z.uuid();

function colunas(d: LeadVendasDados) {
  return {
    nome: d.nome,
    cidade: d.cidade,
    uf: d.uf,
    telefone: d.telefone?.telefone ?? null,
    telefoneDigitos: d.telefone?.digitos ?? null,
    whatsapp: d.telefone?.whatsapp ?? null,
    categoria: d.categoria,
    segmento: d.segmento,
    prioridade: d.prioridade,
    avaliacoes: d.avaliacoes,
    origem: d.origem,
    observacoes: d.observacoes,
    proximoFollowup: d.proximoFollowup,
    naoContatar: d.naoContatar,
  };
}

/** Cadastra um lead à mão: entra em "Não contatado", com o movimento "Cadastro manual". */
export async function criarLead(entrada: LeadVendasEntrada): Promise<Resultado<{ id: string }>> {
  return acao(async () => {
    const v = leadVendasSchema.safeParse(entrada);
    if (!v.success) return { ok: false, erro: INVALIDO, campos: camposDoZod(v.error) };
    const d = v.data;
    const id = await obterDb().transaction(async (tx) => {
      const [lead] = await tx
        .insert(vendasLeads)
        .values({
          ...colunas(d),
          dataEntrada: d.dataEntrada ?? hojeNoFuso(),
          naoContatarEm: d.naoContatar ? new Date() : null,
        })
        .returning({ id: vendasLeads.id });
      await tx.insert(vendasMovimentos).values({
        leadId: lead!.id,
        de: null,
        para: 'nao_contatado',
        origem: 'manual',
        motivo: 'Cadastro manual',
      });
      return lead!.id;
    });
    return { ok: true, mensagem: 'Lead cadastrado.', dados: { id } };
  });
}

/** Edita os dados do lead (a etapa não muda aqui). */
export async function atualizarLead(id: string, entrada: LeadVendasEntrada): Promise<Resultado> {
  return acao(async () => {
    if (!uuid.safeParse(id).success) return { ok: false, erro: 'Lead não encontrado.' };
    const v = leadVendasSchema.safeParse(entrada);
    if (!v.success) return { ok: false, erro: INVALIDO, campos: camposDoZod(v.error) };
    const d = v.data;
    const achou = await obterDb().transaction(async (tx) => {
      const [atual] = await tx
        .select({ naoContatar: vendasLeads.naoContatar })
        .from(vendasLeads)
        .where(eq(vendasLeads.id, id))
        .for('update');
      if (!atual) return false;
      await tx
        .update(vendasLeads)
        .set({
          ...colunas(d),
          ...(d.dataEntrada ? { dataEntrada: d.dataEntrada } : {}),
          // guarda quando o lead pediu para parar; desmarcar limpa a data
          ...(d.naoContatar !== atual.naoContatar && {
            naoContatarEm: d.naoContatar ? new Date() : null,
          }),
        })
        .where(eq(vendasLeads.id, id));
      return true;
    });
    if (!achou) return { ok: false, erro: 'Lead não encontrado.' };
    return { ok: true, mensagem: 'Lead salvo.' };
  });
}
