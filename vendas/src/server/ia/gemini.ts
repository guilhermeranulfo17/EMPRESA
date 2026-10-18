import 'server-only';
import { ERROS_IA, type PedidoIa, type RespostaIa } from './tipos';

/** Gemini pela API REST (generateContent), pedindo JSON no formato do schema. */
export async function gerarGemini(pedido: PedidoIa, modelo: string): Promise<RespostaIa> {
  const base = { provedor: 'gemini' as const, modelo };
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) return { ok: false, erro: ERROS_IA.semChave('GEMINI_API_KEY'), ...base };
  let r: Response;
  try {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: pedido.sistema }] },
          contents: [{ role: 'user', parts: [{ text: pedido.usuario }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: pedido.schema,
            temperature: 0.7,
          },
        }),
        signal: AbortSignal.timeout(90_000),
      },
    );
  } catch {
    return { ok: false, erro: ERROS_IA.fora, ...base };
  }
  if (r.status === 401 || r.status === 403)
    return { ok: false, erro: ERROS_IA.chaveInvalida, ...base };
  if (r.status === 429) return { ok: false, erro: ERROS_IA.limite, ...base };
  if (!r.ok) return { ok: false, erro: ERROS_IA.fora, ...base };
  const corpo = (await r.json().catch(() => null)) as {
    candidates?: {
      finishReason?: string;
      content?: { parts?: { text?: string; thought?: boolean }[] };
    }[];
    promptFeedback?: { blockReason?: string };
  } | null;
  if (corpo?.promptFeedback?.blockReason) return { ok: false, erro: ERROS_IA.recusou, ...base };
  const c = corpo?.candidates?.[0];
  if (c?.finishReason === 'SAFETY') return { ok: false, erro: ERROS_IA.recusou, ...base };
  if (c?.finishReason === 'MAX_TOKENS') return { ok: false, erro: ERROS_IA.cortada, ...base };
  // partes de raciocínio (thought) não fazem parte da resposta
  const texto =
    c?.content?.parts
      ?.filter((p) => !p.thought)
      .map((p) => p.text ?? '')
      .join('') ?? '';
  return texto ? { ok: true, texto, ...base } : { ok: false, erro: ERROS_IA.fora, ...base };
}
