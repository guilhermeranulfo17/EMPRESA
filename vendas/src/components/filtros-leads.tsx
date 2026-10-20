'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PRIORIDADES, ROTULO_SEGMENTO, SEGMENTOS } from '@/domain/vendas/campos';
import { ETAPAS_VENDAS, ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { cn } from '@/lib/utils';

export type OpcaoCidadeTela = { valor: string; rotulo: string; total: number };

const classeSelect =
  'rounded-control border-input bg-card h-11 w-full min-w-0 border px-3 text-base md:text-sm';

/**
 * Filtros da lista e do funil (cidade, prioridade, segmento, etapa e busca). Ficam na URL: mudar
 * um filtro já recarrega, sem botão de "aplicar".
 */
export function FiltrosLeads({
  cidades,
  comEtapa = true,
}: {
  cidades: OpcaoCidadeTela[];
  comEtapa?: boolean;
}) {
  const router = useRouter();
  const caminho = usePathname();
  const params = useSearchParams();
  const ativos = ['cidade', 'prioridade', 'segmento', 'etapa'].filter((k) => params.get(k)).length;
  const [aberto, setAberto] = useState(ativos > 0);
  const [busca, setBusca] = useState(params.get('q') ?? '');

  function mudar(chave: string, valor: string) {
    const novo = new URLSearchParams(params);
    if (valor) novo.set(chave, valor);
    else novo.delete(chave);
    novo.delete('ver');
    router.replace(`${caminho}${novo.size ? `?${novo}` : ''}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <form
          role="search"
          className="relative min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            mudar('q', busca.trim());
          }}
        >
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nome ou telefone"
            aria-label="Buscar lead"
            enterKeyHint="search"
            className={cn(classeSelect, 'pl-9')}
          />
        </form>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          className={cn(
            'rounded-control relative inline-flex min-h-11 shrink-0 items-center gap-1.5 border px-3 text-sm font-semibold',
            ativos && 'border-primary text-primary',
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtros{ativos ? ` (${ativos})` : ''}
        </button>
      </div>
      {aberto && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="filtros">
          <select
            aria-label="Cidade"
            className={cn(classeSelect, 'col-span-2 md:col-span-1')}
            value={params.get('cidade') ?? ''}
            onChange={(e) => mudar('cidade', e.target.value)}
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo} ({c.total})
              </option>
            ))}
          </select>
          <select
            aria-label="Prioridade"
            className={classeSelect}
            value={params.get('prioridade') ?? ''}
            onChange={(e) => mudar('prioridade', e.target.value)}
          >
            <option value="">Prioridade</option>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                Prioridade {p}
              </option>
            ))}
            <option value="sem">Sem prioridade</option>
          </select>
          <select
            aria-label="Segmento"
            className={classeSelect}
            value={params.get('segmento') ?? ''}
            onChange={(e) => mudar('segmento', e.target.value)}
          >
            <option value="">Segmento</option>
            {SEGMENTOS.map((s) => (
              <option key={s} value={s}>
                {ROTULO_SEGMENTO[s]}
              </option>
            ))}
            <option value="sem">Sem segmento</option>
          </select>
          {comEtapa && (
            <select
              aria-label="Etapa"
              className={cn(classeSelect, 'col-span-2 md:col-span-1')}
              value={params.get('etapa') ?? ''}
              onChange={(e) => mudar('etapa', e.target.value)}
            >
              <option value="">Todas as etapas</option>
              {ETAPAS_VENDAS.map((e) => (
                <option key={e} value={e}>
                  {ROTULO_ETAPA_VENDAS[e]}
                </option>
              ))}
            </select>
          )}
          {(ativos > 0 || params.get('q')) && (
            <button
              type="button"
              onClick={() => {
                setBusca('');
                router.replace(caminho);
              }}
              className="text-muted-foreground col-span-2 inline-flex min-h-10 items-center gap-1 text-sm font-semibold md:col-span-4"
            >
              <X className="size-4" aria-hidden /> Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
