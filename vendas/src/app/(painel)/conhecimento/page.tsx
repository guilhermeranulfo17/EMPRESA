import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { exigirGui } from '@/server/guard';

export const metadata: Metadata = { title: 'Conhecimento' };
export const dynamic = 'force-dynamic';

export default async function PaginaConhecimento() {
  await exigirGui();
  return (
    <EmptyState icone={BookOpen} titulo="Base de conhecimento vazia">
      Produto, preço, objeções com respostas e scripts. O copiloto só afirma o que estiver aqui.
    </EmptyState>
  );
}
