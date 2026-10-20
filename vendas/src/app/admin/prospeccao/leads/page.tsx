import type { Metadata } from 'next';
import { Columns3, Plus, Upload, Users } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { SeloPrioridade } from '@/components/card-envio';
import { EmptyState } from '@/components/empty-state';
import { SeletorEtapa } from '@/components/etapa-rapida';
import { FiltrosLeads } from '@/components/filtros-leads';
import { formatData, hojeNoFuso } from '@/domain/dates';
import { ROTULO_SEGMENTO, rotuloCidade } from '@/domain/vendas/campos';
import { ROTAS } from '@/lib/rotas';
import { cn } from '@/lib/utils';
import { exigirGui } from '@/server/guard';
import { encerrarSemResposta, lerFiltros, listarCidades, listarLeads } from '@/server/vendas/leads';

export const metadata: Metadata = { title: 'Leads' };
export const dynamic = 'force-dynamic';

const POR_PAGINA = 100;

export default async function PaginaLeads({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirGui();
  const params = await searchParams;
  const filtros = lerFiltros(params);
  const ver = Math.min(5000, Math.max(POR_PAGINA, Number(params.ver) || POR_PAGINA));
  const hoje = hojeNoFuso();
  await encerrarSemResposta(hoje);
  const [{ leads, total }, cidades] = await Promise.all([
    listarLeads(filtros, ver),
    listarCidades(),
  ]);
  const importados = typeof params.importados === 'string' ? params.importados : null;
  const filtrado = Object.values(filtros).some(Boolean);
  const mais = new URLSearchParams(params as Record<string, string>);
  mais.set('ver', String(ver + POR_PAGINA * 2));

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm" data-testid="total-leads">
            {total} {total === 1 ? 'lead' : 'leads'}
            {filtrado ? ' no filtro' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={ROTAS.funil}
            className="rounded-control grid size-11 place-items-center border"
            aria-label="Ver em kanban"
          >
            <Columns3 className="size-5" aria-hidden />
          </Link>
          <Link
            href={ROTAS.importar}
            className="rounded-control grid size-11 place-items-center border"
            aria-label="Importar planilha"
            data-testid="importar"
          >
            <Upload className="size-5" aria-hidden />
          </Link>
          <Link
            href={ROTAS.novoLead}
            className="bg-primary text-primary-foreground rounded-control grid size-11 place-items-center"
            aria-label="Novo lead"
            data-testid="novo-lead"
          >
            <Plus className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      {importados !== null && /^\d+$/.test(importados) && (
        <p
          role="status"
          data-testid="aviso-importacao"
          className="bg-sucesso/10 text-sucesso border-sucesso/30 rounded-control border px-3 py-2 text-sm"
        >
          {importados === '1' ? '1 lead importado.' : `${importados} leads importados.`}
        </p>
      )}

      <Suspense>
        <FiltrosLeads
          cidades={cidades.map((c) => ({
            valor: c.valor,
            rotulo: rotuloCidade(c.cidade, c.uf),
            total: c.total,
          }))}
        />
      </Suspense>

      {leads.length === 0 ? (
        <EmptyState
          icone={Users}
          titulo={filtrado ? 'Nenhum lead nesse filtro' : 'Nenhum lead ainda'}
        >
          {filtrado ? (
            'Tente outro filtro ou limpe a busca.'
          ) : (
            <>
              <Link href={ROTAS.importar} className="text-primary font-semibold">
                Importe a planilha
              </Link>{' '}
              ou cadastre à mão.
            </>
          )}
        </EmptyState>
      ) : (
        <ul className="bg-card rounded-card divide-y border" data-testid="lista-leads">
          {leads.map((l) => {
            const atrasado = l.proximoFollowup !== null && l.proximoFollowup <= hoje;
            return (
              <li key={l.id} className="flex items-center gap-3 px-3 py-3" data-testid="item-lead">
                <SeloPrioridade prioridade={l.prioridade} />
                <Link href={ROTAS.lead(l.id)} className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{l.nome}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {[
                      l.cidade || l.uf ? rotuloCidade(l.cidade, l.uf) : null,
                      l.segmento && ROTULO_SEGMENTO[l.segmento],
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {l.proximoFollowup && (
                    <span
                      className={cn(
                        'block text-xs',
                        atrasado ? 'text-alerta font-semibold' : 'text-muted-foreground',
                      )}
                    >
                      Follow-up {formatData(l.proximoFollowup)}
                    </span>
                  )}
                </Link>
                <SeletorEtapa key={`${l.id}-${l.etapa}`} id={l.id} etapa={l.etapa} />
              </li>
            );
          })}
        </ul>
      )}
      {total > leads.length && (
        <Link
          href={`${ROTAS.leads}?${mais}`}
          className="rounded-control text-muted-foreground min-h-12 border border-dashed px-4 py-3 text-center text-sm font-semibold"
        >
          Mostrar mais ({total - leads.length} restantes)
        </Link>
      )}
    </div>
  );
}
