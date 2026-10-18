import 'server-only';
import type { Provedor } from './tipos';

/*
 * Provedor e modelo da IA, só por variável de ambiente (nenhuma chave no código):
 *   VENDAS_IA_PROVEDOR = gemini (padrão) | claude | simulado (só testes, resposta fixa)
 *   VENDAS_IA_MODELO   = opcional; sem ela, o padrão de cada provedor
 *   GEMINI_API_KEY / ANTHROPIC_API_KEY = a chave do provedor escolhido
 */

export const MODELO_PADRAO: Record<Provedor, string> = {
  gemini: 'gemini-3.8-flash',
  claude: 'claude-opus-5-5',
  simulado: 'simulado',
};

export function configIa(): { provedor: Provedor; modelo: string } {
  const p = (process.env.VENDAS_IA_PROVEDOR ?? 'gemini').trim().toLowerCase();
  const provedor: Provedor = p === 'claude' || p === 'simulado' ? p : 'gemini';
  const modelo = process.env.VENDAS_IA_MODELO?.trim() || MODELO_PADRAO[provedor];
  return { provedor, modelo };
}

/** Nome da variável da chave de cada provedor (o simulado não precisa de chave). */
export const VARIAVEL_CHAVE: Record<Provedor, string | null> = {
  gemini: 'GEMINI_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
  simulado: null,
};

/** Se a chave do provedor está preenchida. Nunca devolve a chave. */
export function chaveConfigurada(provedor: Provedor): boolean {
  const variavel = VARIAVEL_CHAVE[provedor];
  return variavel === null || Boolean(process.env[variavel]?.trim());
}
