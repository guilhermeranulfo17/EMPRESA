import type { Metadata } from 'next';
import { Columns3, List } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { EmptyState } from '@/components/empty-state';
import { FiltrosLeads } from '@/components/filtros-leads';
import { Kanban } from '@/components/kanban';
import { hojeNoFuso } from '@/domain/dates';
import { rotuloCidade } from '@/domain/vendas/campos';
import { ROTAS } from '@/lib/rotas';
import { exigirGui } from '@/server/guard';
import {
  encerrarSemResposta,
  lerFiltros,
  listarCidades,
  listarPipeline,
} from '@/server/vendas/leads';

export const metadata: Metadata = { title: 'Funil' };
export const dynamic = 'force-dynamic';

export default async function PaginaFunil({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirGui();
  const filtros = { ...lerFiltros(await searchParams), etapa: null };
  await encerrarSemResposta(hojeNoFuso());
  const [cards, cidades] = await Promise.all([listarPipeline(filtros), listarCidades()]);
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">Funil</h1>
          <p className="text-muted-foreground text-sm">
            Arraste o card no PC ou use “Mover para” no celular.
          </p>
        </div>
        <Link
          href={ROTAS.leads}
          className="rounded-control grid size-11 place-items-center border"
          aria-label="Ver em lista"
        >
          <List className="size-5" aria-hidden />
        </Link>
      </header>
      <Suspense>
        <FiltrosLeads
          comEtapa={false}
          cidades={cidades.map((c) => ({
            valor: c.valor,
            rotulo: rotuloCidade(c.cidade, c.uf),
            total: c.total,
          }))}
        />
      </Suspense>
      {cards.length === 0 ? (
        <EmptyState icone={Columns3} titulo="Funil vazio">
          Os leads aparecem aqui nas 7 etapas, de Não contatado a Fechou.
        </EmptyState>
      ) : (
        <Kanban key={JSON.stringify(filtros)} inicial={cards} />
      )}
    </div>
  );
}
