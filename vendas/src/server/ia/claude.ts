import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { ERROS_IA, type PedidoIa, type RespostaIa } from './tipos';

/*
 * Claude pelo SDK oficial, com saída em JSON Schema (output_config.format). Esforço baixo:
 * a resposta é uma mensagem curta de WhatsApp. Com recusa do classificador de segurança, o
 * próprio servidor tenta outro modelo (fallbacks: "default").
 */
export async function gerarClaude(pedido: PedidoIa, modelo: string): Promise<RespostaIa> {
  const base = { provedor: 'claude' as const, modelo };
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return { ok: false, erro: ERROS_IA.semChave('ANTHROPIC_API_KEY'), ...base };
  }
  const cliente = new Anthropic({ timeout: 90_000, maxRetries: 1 });
  try {
    const params = {
      model: modelo,
      max_tokens: 16000,
      system: pedido.sistema,
      messages: [{ role: 'user' as const, content: pedido.usuario }],
      output_config: {
        effort: 'low' as const,
        format: { type: 'json_schema' as const, schema: pedido.schema },
      },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    };
    const resposta = await cliente.beta.messages.create(
      params as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming,
    );
    if (resposta.stop_reason === 'refusal') return { ok: false, erro: ERROS_IA.recusou, ...base };
    if (resposta.stop_reason === 'max_tokens')
      return { ok: false, erro: ERROS_IA.cortada, ...base };
    const texto = resposta.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
    return texto
      ? { ok: true, texto, ...base, modelo: resposta.model }
      : { ok: false, erro: ERROS_IA.fora, ...base };
  } catch (erro) {
    if (
      erro instanceof Anthropic.AuthenticationError ||
      erro instanceof Anthropic.PermissionDeniedError
    ) {
      return { ok: false, erro: ERROS_IA.chaveInvalida, ...base };
    }
    if (erro instanceof Anthropic.RateLimitError)
      return { ok: false, erro: ERROS_IA.limite, ...base };
    return { ok: false, erro: ERROS_IA.fora, ...base };
  }
}
