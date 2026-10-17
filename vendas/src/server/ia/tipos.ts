export type Provedor = 'gemini' | 'claude' | 'simulado';

export type PedidoIa = { sistema: string; usuario: string; schema: Record<string, unknown> };

export type RespostaIa =
  | { ok: true; texto: string; provedor: Provedor; modelo: string }
  | { ok: false; erro: string; provedor: Provedor; modelo: string };

export const ERROS_IA = {
  semChave: (variavel: string) =>
    `A IA não está configurada neste servidor: falta a variável ${variavel}.`,
  chaveInvalida: 'A chave da IA foi recusada. Confira a chave configurada no servidor.',
  limite: 'O limite do plano da IA foi atingido. Espere um minuto e tente de novo.',
  recusou: 'A IA preferiu não responder a esse pedido. Reescreva o texto e tente de novo.',
  cortada: 'A resposta da IA veio cortada. Tente de novo.',
  fora: 'A IA não respondeu agora. Tente de novo em instantes.',
} as const;
