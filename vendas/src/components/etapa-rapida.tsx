'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  COR_ETAPA,
  ETAPAS_VENDAS,
  ROTULO_CURTO_ETAPA,
  ROTULO_ETAPA_VENDAS,
  type EtapaVendas,
} from '@/domain/vendas/etapas';
import { cn } from '@/lib/utils';
import { moverLead } from '@/server/actions/pipeline';

function useMover(id: string, inicial: EtapaVendas) {
  const router = useRouter();
  const [etapa, setEtapa] = useState(inicial);
  const [erro, setErro] = useState('');
  const [salvando, iniciar] = useTransition();
  const mover = (para: EtapaVendas) => {
    if (para === etapa) return;
    const antes = etapa;
    setEtapa(para);
    setErro('');
    iniciar(async () => {
      const r = await moverLead(id, para);
      if (!r.ok) {
        setEtapa(antes);
        setErro(r.erro);
        return;
      }
      router.refresh();
    });
  };
  return { etapa, erro, salvando, mover };
}

/** Chip da etapa na lista: tocar abre a lista do celular e escolher já grava. */
export function SeletorEtapa({ id, etapa: inicial }: { id: string; etapa: EtapaVendas }) {
  const { etapa, erro, salvando, mover } = useMover(id, inicial);
  return (
    <label className="relative shrink-0" title={erro || 'Mudar etapa'}>
      <span className="sr-only">Etapa</span>
      <select
        value={etapa}
        disabled={salvando}
        onChange={(e) => mover(e.target.value as EtapaVendas)}
        data-testid="seletor-etapa"
        className={cn(
          'h-9 max-w-40 cursor-pointer appearance-none rounded-full border-0 px-3 text-xs font-semibold',
          COR_ETAPA[etapa],
          erro && 'ring-erro ring-2',
        )}
      >
        {ETAPAS_VENDAS.map((e) => (
          <option key={e} value={e}>
            {ROTULO_ETAPA_VENDAS[e]}
          </option>
        ))}
      </select>
    </label>
  );
}

/** No lead: as 7 etapas lado a lado; um toque muda e entra no histórico. */
export function BotoesEtapa({ id, etapa: inicial }: { id: string; etapa: EtapaVendas }) {
  const { etapa, erro, salvando, mover } = useMover(id, inicial);
  return (
    <div className="flex flex-col gap-2" data-testid="botoes-etapa">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {ETAPAS_VENDAS.map((e) => (
          <button
            key={e}
            type="button"
            disabled={salvando}
            aria-pressed={etapa === e}
            onClick={() => mover(e)}
            className={cn(
              'rounded-control min-h-12 border px-2 text-sm font-semibold transition-colors',
              etapa === e
                ? cn(COR_ETAPA[e], 'border-transparent')
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {ROTULO_CURTO_ETAPA[e]}
          </button>
        ))}
      </div>
      {erro && (
        <p role="alert" className="text-erro text-sm">
          {erro}
        </p>
      )}
    </div>
  );
}
