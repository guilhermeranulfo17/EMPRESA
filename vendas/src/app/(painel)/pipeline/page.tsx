import type { Metadata } from 'next';
import { Columns3 } from 'lucide-react';
import { CabecalhoPagina } from '@/components/cabecalho-pagina';
import { EmptyState } from '@/components/empty-state';
import { Kanban } from '@/components/kanban';
import { exigirGui } from '@/server/guard';
import { listarPipeline } from '@/server/vendas/leads';

export const metadata: Metadata = { title: 'Pipeline' };
export const dynamic = 'force-dynamic';

export default async function PaginaPipeline() {
  await exigirGui();
  const cards = await listarPipeline();
  if (cards.length === 0) {
    return (
      <EmptyState icone={Columns3} titulo="Pipeline vazio">
        Os leads aparecem aqui nas etapas Novo, Abordado, Respondeu, Interessado, Fechando, Cliente
        e Perdido.
      </EmptyState>
    );
  }
  return (
    <>
      <CabecalhoPagina
        titulo="Pipeline"
        descricao="Arraste o card para mudar a etapa. O copiloto também move quando a conversa avança."
      />
      <Kanban inicial={cards} />
    </>
  );
}
