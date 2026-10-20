'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { emailPermitido } from '@/domain/acesso';
import { criarClienteSupabase } from '@/lib/supabase/server';
import { ROTAS } from '@/lib/rotas';
import { emailsPermitidos } from '@/server/env';

const ERRO = 'E-mail ou senha incorretos.';
const schema = z.object({ email: z.string().trim().email(), senha: z.string().min(1) });

/** Login. Fora da lista responde igual a senha errada (não revela quem tem acesso). */
export async function entrar(entrada: { email: string; senha: string }): Promise<{ erro: string }> {
  const v = schema.safeParse(entrada);
  if (!v.success || !emailPermitido(v.data.email, emailsPermitidos())) return { erro: ERRO };
  const supabase = await criarClienteSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: v.data.email,
    password: v.data.senha,
  });
  if (error) return { erro: ERRO };
  redirect(ROTAS.hoje);
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteSupabase();
  await supabase.auth.signOut();
  redirect('/entrar');
}
