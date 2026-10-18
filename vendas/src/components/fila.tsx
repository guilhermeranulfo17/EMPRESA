'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Decisao, type PendenteTela } from '@/components/decisao';
import { ROTULO_ETAPA_VENDAS, type EtapaVendas } from '@/domain/vendas/etapas';
import type { MotivoFila } from '@/domain/vendas/fila';
import { cn } from '@/lib/utils';
import { gerarMensagem } from '@/server/actions/conversa';
import { moverLead } from '@/server/actions/pipeline';

export type ItemFilaTela = {
  id: string;
  nome: string;
  buffet: string | null;
  cidade: string | null;
  etapa: EtapaVendas;
  resumo: string | null;
  tentativas: number;
  motivo: MotivoFila;
  descricao: string;
  telefoneE164: string | null;
  pendente: PendenteTela | null;
};

const COR_MOTIVO: Record<MotivoFila, string> = {
  pendente: 'bg-info/15 text-info',
  atrasado: 'bg-erro/15 text-erro',
  hoje: 'bg-alerta/15 text-alerta',
  novo: 'bg-primary/15 text-primary',
  encerrar: 'bg-muted text-muted-foreground',
};

const NOVOS_VISIVEIS = 10;

/** A Fila do dia: cada lead com o próximo passo e a mensagem pronta para aprovar. */
export function Fila({ itens }: { itens: ItemFilaTela[] }) {
  const [todosNovos, setTodosNovos] = useState(false);
  const novos = itens.filter((i) => i.motivo === 'novo');
  const escondidos = todosNovos ? 0 : Math.max(0, novos.length - NOVOS_VISIVEIS);
  const idsNovosVisiveis = new Set(
    novos.slice(0, todosNovos ? novos.length : NOVOS_VISIVEIS).map((i) => i.id),
  );
  const visiveis = itens.filter((i) => i.motivo !== 'novo' || idsNovosVisiveis.has(i.id));

  return (
    <ol className="flex flex-col gap-3" data-testid="fila">
      {visiveis.map((i) => (
        <ItemFila key={i.id} item={i} />
      ))}
      {escondidos > 0 && (
        <li>
          <button
            type="button"
            className="rounded-control min-h-11 w-full border border-dashed px-4 text-sm font-semibold"
            onClick={() => setTodosNovos(true)}
          >
            Mostrar mais {escondidos} {escondidos === 1 ? 'lead novo' : 'leads novos'}
          </button>
        </li>
      )}
    </ol>
  );
}

function ItemFila({ item }: { item: ItemFilaTela }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, iniciar] = useTransition();
  const detalhe = [item.buffet !== item.nome ? item.buffet : null, item.cidade]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="bg-card rounded-card flex flex-col gap-3 border p-4" data-testid="item-fila">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/leads/${item.id}`} className="font-bold hover:underline">
            {item.nome}
          </Link>
          {detalhe && <p className="text-muted-foreground text-sm">{detalhe}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="bg-muted rounded-full px-2 py-0.5">
            {ROTULO_ETAPA_VENDAS[item.etapa]}
          </span>
          <span
            className={cn('rounded-full px-2 py-0.5 font-semibold', COR_MOTIVO[item.motivo])}
            data-testid="motivo-fila"
          >
            {item.descricao}
          </span>
        </div>
      </div>
      {item.resumo && <p className="text-muted-foreground line-clamp-2 text-sm">{item.resumo}</p>}

      {item.pendente ? (
        <Decisao
          key={item.pendente.id}
          pendente={item.pendente}
          telefoneE164={item.telefoneE164}
          aoDecidir={() => router.refresh()}
        />
      ) : item.motivo === 'encerrar' ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-muted-foreground w-full text-sm">
            Mandou {item.tentativas} mensagens e não teve resposta. Hora de encerrar.
          </p>
          <button
            type="button"
            disabled={ocupado}
            className="rounded-control min-h-11 border px-4 font-semibold disabled:opacity-60"
            onClick={() =>
              iniciar(async () => {
                const r = await moverLead(item.id, 'perdido', 'Sem resposta após 3 tentativas');
                if (!r.ok) return setErro(r.erro);
                router.refresh();
              })
            }
          >
            Encerrar (mover para Perdido)
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={ocupado}
          className="bg-primary text-primary-foreground min-h-11 self-start rounded-full px-5 font-semibold disabled:opacity-60"
          onClick={() => {
            setErro(null);
            iniciar(async () => {
              const r = await gerarMensagem(item.id);
              if (!r.ok) return setErro(r.erro);
              router.refresh();
            });
          }}
        >
          {ocupado ? 'Gerando…' : item.motivo === 'novo' ? 'Gerar abordagem' : 'Gerar follow-up'}
        </button>
      )}
      {erro && (
        <p
          role="status"
          className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm"
        >
          {erro}
        </p>
      )}
    </li>
  );
}
