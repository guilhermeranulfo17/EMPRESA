import { redirect } from 'next/navigation';
import { ROTAS } from '@/lib/rotas';

/** A raiz leva direto para a área de prospecção (quem não está logado cai no /entrar). */
export default function Raiz() {
  redirect(ROTAS.hoje);
}
