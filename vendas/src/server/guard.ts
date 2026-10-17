import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { emailPermitido } from '@/domain/acesso';
import { criarClienteSupabase } from '@/lib/supabase/server';
import { emailsPermitidos } from '@/server/env';

export type Usuario = { id: string; email: string };

/** Usuário logado e na lista VENDAS_EMAILS. Sem isso, volta para /entrar. */
export const exigirGui = cache(async (): Promise<Usuario> => {
  const supabase = await criarClienteSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !emailPermitido(user.email, emailsPermitidos())) redirect('/entrar');
  return { id: user.id, email: user.email!.toLowerCase() };
});
