'use server';

import { z } from 'zod';
import { hojeNoFuso } from '@/domain/dates';
import { type SaidaAgente, montarSituacao } from '@/domain/vendas/agente';
import { baseParaPrompt } from '@/domain/vendas/conhecimento';
import { exigirGui } from '@/server/guard';
import { chamarCopiloto } from '@/server/ia/copiloto';
import { listarConhecimento } from '@/server/vendas/conhecimento';

export type ResultadoTeste =
  | { ok: true; saida: SaidaAgente; provedor: string; modelo: string; promptVersao: string }
  | { ok: false; erro: string };

const entradaSchema = z
  .string()
  .trim()
  .min(1, 'Cole uma conversa para testar.')
  .max(4000, 'Texto longo demais para o teste.');

/**
 * Testa a IA com um lead fictício e a base de conhecimento de verdade. Não grava nada:
 * serve para ver se a chave, o modelo e o prompt estão funcionando.
 */
export async function testarIa(texto: string): Promise<ResultadoTeste> {
  await exigirGui();
  const entrada = entradaSchema.safeParse(texto);
  if (!entrada.success) return { ok: false, erro: entrada.error.issues[0]!.message };
  try {
    const base = baseParaPrompt(await listarConhecimento());
    const usuario = montarSituacao({
      hoje: hojeNoFuso(),
      base,
      lead: {
        nome: 'Buffet de teste',
        cidade: null,
        uf: null,
        segmento: null,
        categoria: null,
        etapa: 'mensagem_1',
        resumo: null,
        observacoes: null,
        proximoFollowup: null,
      },
      historico: [],
      entrada: entrada.data,
    });
    const r = await chamarCopiloto(usuario);
    if (!r.ok) return { ok: false, erro: r.erro };
    return {
      ok: true,
      saida: r.saida,
      provedor: r.provedor,
      modelo: r.modelo,
      promptVersao: r.promptVersao,
    };
  } catch {
    return { ok: false, erro: 'Não foi possível testar a IA agora.' };
  }
}
