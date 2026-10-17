/*
 * Quem pode entrar no Vendas Orkestra: só os e-mails da lista VENDAS_EMAILS (separados por
 * vírgula). Lista vazia = ninguém entra (nunca "todo mundo").
 */

export function listaDeEmails(valor: string | undefined): string[] {
  return (valor ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes('@'));
}

export function emailPermitido(email: string | null | undefined, lista: string[]): boolean {
  return !!email && lista.includes(email.trim().toLowerCase());
}
