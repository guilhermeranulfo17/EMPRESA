import { ehCelularBR, toE164 } from '../phone';

/*
 * Telefone do lead: só os dígitos são a chave (a importação nunca duplica), o texto é
 * "(34) 99999-9999" e o link wa.me existe só para celular. Fica separado de campos.ts para a
 * biblioteca de telefone não ir para o navegador em toda tela.
 */

/**
 * Só os dígitos de um telefone brasileiro (DDD + número), sem o 55 e sem o 0 da frente.
 * "(34) 99999-9999", "+55 34 99999-9999", "034999999999" e "5534999999999" dão "34999999999".
 * Número que não é telefone brasileiro válido dá null.
 */
export function digitosTelefone(entrada: string | null | undefined): string | null {
  let d = (entrada ?? '').replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);
  if ((d.length === 11 || d.length === 12) && d.startsWith('0')) d = d.slice(1);
  if (d.length !== 10 && d.length !== 11) return null;
  return toE164(d, 'BR') ? d : null;
}

/** "34999999999" → "(34) 99999-9999"; "3432135450" → "(34) 3213-5450". */
export function formatarTelefone(digitos: string): string {
  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);
  const corte = resto.length - 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

/** Celular (11 dígitos, 9 depois do DDD): só ele tem WhatsApp. */
export function ehCelular(digitos: string | null): boolean {
  return !!digitos && digitos.length === 11 && ehCelularBR(digitos);
}

/** Link wa.me do celular, com ou sem texto pronto. Fixo não tem link. */
export function linkWhatsApp(digitos: string | null, texto?: string): string | null {
  if (!ehCelular(digitos)) return null;
  const base = `https://wa.me/55${digitos}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

/** Os dígitos de um link wa.me salvo ("https://wa.me/5534999999999" → "34999999999"). */
export function digitosDoWhatsApp(link: string | null): string | null {
  return link ? digitosTelefone(link.replace(/^https:\/\/wa\.me\//, '')) : null;
}

export type Telefone = { telefone: string; digitos: string; whatsapp: string | null };

/**
 * Telefone do lead a partir do número e (opcional) do WhatsApp informado à parte. O WhatsApp
 * vale quando for celular; senão, o próprio telefone, se for celular.
 */
export function montarTelefone(numero: string | null, whatsapp?: string | null): Telefone | null {
  const dNumero = digitosTelefone(numero);
  const dWhats = digitosTelefone(whatsapp);
  const digitos = dNumero ?? dWhats;
  if (!digitos) return null;
  const celular = [dWhats, dNumero].find((d) => ehCelular(d)) ?? null;
  return { telefone: formatarTelefone(digitos), digitos, whatsapp: linkWhatsApp(celular) };
}
