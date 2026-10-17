import 'server-only';
import { listaDeEmails } from '@/domain/acesso';

/** Variáveis do servidor. Nenhuma chave fica no código: tudo vem do ambiente (.env.local ou Vercel). */

export const emailsPermitidos = () => listaDeEmails(process.env.VENDAS_EMAILS);

export function urlBanco(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não configurada.');
  return url;
}
