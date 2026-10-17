import type { Metadata } from 'next';
import { CalendarCheck } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { exigirGui } from '@/server/guard';

export const metadata: Metadata = { title: 'Fila do dia' };
export const dynamic = 'force-dynamic';

export default async function PaginaFilaDoDia() {
  await exigirGui();
  return (
    <EmptyState icone={CalendarCheck} titulo="Nada na fila hoje">
      Aqui aparecem os leads novos e os follow-ups vencidos.
    </EmptyState>
  );
}
