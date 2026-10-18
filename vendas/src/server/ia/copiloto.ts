import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  lerArquivoPrompt,
  lerSaidaAgente,
  SCHEMA_SAIDA_AGENTE,
  type SaidaAgente,
} from '@/domain/vendas/agente';
import { gerarClaude } from './claude';
import { configIa } from './config';
import { gerarGemini } from './gemini';
import { gerarSimulado } from './simulado';
import type { PedidoIa, Provedor } from './tipos';

/*
 * O copiloto: lê o prompt versionado (prompts/copiloto.<versao>.md), chama o provedor
 * configurado e valida o JSON. Resposta fora do formato: tenta mais uma vez; se falhar de
 * novo, devolve o erro amigável e nada é gravado.
 */

export type ResultadoCopiloto =
  | { ok: true; saida: SaidaAgente; provedor: Provedor; modelo: string; promptVersao: string }
  | { ok: false; erro: string; provedor: Provedor; modelo: string; promptVersao: string };

export async function carregarPrompt(): Promise<{ versao: string; texto: string }> {
  const versao = (process.env.VENDAS_PROMPT_VERSAO || 'v2').replace(/[^a-z0-9-]/gi, '');
  const arquivo = path.join(process.cwd(), 'prompts', `copiloto.${versao}.md`);
  return lerArquivoPrompt(await readFile(arquivo, 'utf8'));
}

export async function chamarCopiloto(usuario: string): Promise<ResultadoCopiloto> {
  const { provedor, modelo } = configIa();
  const prompt = await carregarPrompt();
  const pedido: PedidoIa = { sistema: prompt.texto, usuario, schema: SCHEMA_SAIDA_AGENTE };
  const gerar = () =>
    provedor === 'claude'
      ? gerarClaude(pedido, modelo)
      : provedor === 'simulado'
        ? gerarSimulado(pedido)
        : gerarGemini(pedido, modelo);

  let ultimoErro = '';
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const r = await gerar();
    if (!r.ok) return { ...r, promptVersao: prompt.versao };
    const lida = lerSaidaAgente(r.texto);
    if (lida.ok) {
      return {
        ok: true,
        saida: lida.saida,
        provedor: r.provedor,
        modelo: r.modelo,
        promptVersao: prompt.versao,
      };
    }
    ultimoErro = lida.erro;
  }
  return { ok: false, erro: ultimoErro, provedor, modelo, promptVersao: prompt.versao };
}
