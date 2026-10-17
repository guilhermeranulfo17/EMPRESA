import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { exigirGui } from '@/server/guard';

export const metadata: Metadata = { title: 'Exemplos' };
export const dynamic = 'force-dynamic';

export default async function PaginaExemplos() {
  await exigirGui();
  return (
    <EmptyState icone={Star} titulo="Nenhum exemplo marcado">
      Marque conversas como boas ou ruins, com o motivo em uma frase. Elas ensinam o copiloto.
    </EmptyState>
  );
}
