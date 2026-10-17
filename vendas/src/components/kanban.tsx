'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { formatData } from '@/domain/dates';
import { ETAPAS_VENDAS, ROTULO_ETAPA_VENDAS, type EtapaVendas } from '@/domain/vendas/etapas';
import { agruparPorEtapa, type CardPipeline } from '@/domain/vendas/pipeline';
import { cn } from '@/lib/utils';
import { moverLead } from '@/server/actions/pipeline';

/**
 * Kanban de vendas. No PC as 7 colunas ficam lado a lado e o card é arrastado (arrastar nativo
 * do navegador). No celular cada etapa é uma aba e o card tem "Mover para". A mudança aparece na
 * hora e volta atrás se o servidor recusar.
 */
export function Kanban({ inicial }: { inicial: CardPipeline[] }) {
  const [cards, setCards] = useState(inicial);
  const [aba, setAba] = useState<EtapaVendas>('novo');
  const [sobre, setSobre] = useState<EtapaVendas | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, iniciar] = useTransition();
  // marca quando o arrastar já está ligado no navegador (os testes esperam por isso)
  const [pronto, setPronto] = useState(false);
  useEffect(() => setPronto(true), []);
  const grupos = agruparPorEtapa(cards);

  function mover(id: string, para: EtapaVendas) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.etapa === para) return;
    const antes = cards;
    setCards((cs) => [{ ...card, etapa: para }, ...cs.filter((c) => c.id !== id)]);
    setErro('');
    iniciar(async () => {
      const r = await moverLead(id, para);
      if (!r.ok) {
        setCards(antes);
        setErro(r.erro);
      }
    });
  }

  return (
    <div
      className="flex flex-col gap-3"
      data-testid="kanban"
      data-pronto={pronto || undefined}
      data-salvando={salvando || undefined}
    >
      <p
        className="text-muted-foreground h-5 text-sm"
        aria-live="polite"
        data-testid="status-kanban"
      >
        {salvando ? 'Salvando…' : ''}
      </p>
      {erro && (
        <p className="text-erro text-sm" role="alert" data-testid="erro-kanban">
          {erro}
        </p>
      )}

      {/* celular: uma aba por etapa */}
      <div className="-mx-4 overflow-x-auto px-4 md:hidden">
        <div className="flex w-max gap-1.5">
          {ETAPAS_VENDAS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setAba(e)}
              aria-pressed={aba === e}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-semibold whitespace-nowrap',
                aba === e ? 'bg-card border-ring' : 'text-muted-foreground',
              )}
            >
              {ROTULO_ETAPA_VENDAS[e]} <span className="tabular-nums">{grupos[e].length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex gap-3 md:grid md:min-w-[1100px] md:grid-cols-7 md:gap-2">
          {ETAPAS_VENDAS.map((etapa) => (
            <section
              key={etapa}
              data-testid={`coluna-${etapa}`}
              aria-label={ROTULO_ETAPA_VENDAS[etapa]}
              className={cn(
                'bg-muted/50 rounded-card w-full min-w-0 flex-col gap-2 border p-2 md:flex',
                aba === etapa ? 'flex' : 'hidden',
                sobre === etapa && 'border-ring',
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setSobre(etapa);
              }}
              onDragLeave={() => setSobre((s) => (s === etapa ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setSobre(null);
                mover(e.dataTransfer.getData('text/plain'), etapa);
              }}
            >
              <h2 className="flex items-center justify-between px-2 pt-1 text-sm font-bold">
                {ROTULO_ETAPA_VENDAS[etapa]}
                <span className="text-muted-foreground tabular-nums">{grupos[etapa].length}</span>
              </h2>
              {grupos[etapa].length === 0 && (
                <p className="text-muted-foreground px-2 py-6 text-center text-xs">
                  Arraste um card para cá
                </p>
              )}
              {grupos[etapa].map((c) => (
                <article
                  key={c.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                  data-testid="card-lead"
                  className="bg-card rounded-control flex cursor-grab flex-col gap-1 border p-3 text-sm active:cursor-grabbing"
                >
                  <Link
                    href={`/leads/${c.id}`}
                    draggable={false}
                    className="font-semibold hover:underline"
                  >
                    {c.nome}
                  </Link>
                  {(c.buffet || c.cidade) && (
                    <span className="text-muted-foreground text-xs">
                      {[c.buffet, c.cidade].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  <span className="flex flex-wrap gap-1.5 text-xs">
                    {c.proximoFollowup && (
                      <span className="text-muted-foreground">
                        Follow-up {formatData(c.proximoFollowup)}
                      </span>
                    )}
                    {c.naoContatar && <span className="text-erro">Não contatar</span>}
                  </span>
                  <label className="text-muted-foreground mt-1 flex items-center gap-2 text-xs md:hidden">
                    Mover para
                    <select
                      className="bg-card rounded-control text-foreground h-9 flex-1 border px-2 text-sm"
                      value={c.etapa}
                      onChange={(e) => mover(c.id, e.target.value as EtapaVendas)}
                    >
                      {ETAPAS_VENDAS.map((e) => (
                        <option key={e} value={e}>
                          {ROTULO_ETAPA_VENDAS[e]}
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
