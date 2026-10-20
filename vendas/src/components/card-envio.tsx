'use client';

import { ChevronDown, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { classeCampo } from '@/components/campos';
import { EnviarWhatsApp } from '@/components/enviar-whatsapp';
import { ROTULO_SEGMENTO, type Prioridade, type Segmento } from '@/domain/vendas/campos';
import { COR_ETAPA, ROTULO_CURTO_ETAPA, type EtapaVendas } from '@/domain/vendas/etapas';
import { ROTULO_MODELO, type ChaveModelo } from '@/domain/vendas/modelos';
import { ROTAS } from '@/lib/rotas';
import { cn } from '@/lib/utils';

export type LeadCard = {
  id: string;
  nome: string;
  local: string | null;
  prioridade: Prioridade | null;
  segmento: Segmento | null;
  categoria: string | null;
  avaliacoes: string | null;
  etapa: EtapaVendas;
  telefone: string | null;
  whatsapp: string | null;
};

export function SeloPrioridade({ prioridade }: { prioridade: Prioridade | null }) {
  if (!prioridade) return null;
  return (
    <span
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold',
        prioridade === 'A'
          ? 'bg-primary text-primary-foreground'
          : prioridade === 'B'
            ? 'bg-info/20 text-info'
            : 'bg-muted text-muted-foreground',
      )}
      title={`Prioridade ${prioridade}`}
      data-testid="prioridade"
    >
      {prioridade}
    </span>
  );
}

export function ChipEtapa({ etapa, className }: { etapa: EtapaVendas; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        COR_ETAPA[etapa],
        className,
      )}
    >
      {ROTULO_CURTO_ETAPA[etapa]}
    </span>
  );
}

/**
 * Cartão do HOJE: quem é o lead, a mensagem do modelo já preenchida (dá para ajustar antes) e o
 * botão do WhatsApp, que registra o envio e agenda o próximo follow-up.
 */
export function CardEnvio({
  lead,
  chave,
  texto: textoInicial,
  aviso,
}: {
  lead: LeadCard;
  chave: ChaveModelo | null;
  texto: string;
  /** "Follow-up hoje", "Atrasado 2 dias"… */
  aviso?: string;
}) {
  const [texto, setTexto] = useState(textoInicial);
  const [aberto, setAberto] = useState(false);
  const detalhes = [
    lead.segmento && ROTULO_SEGMENTO[lead.segmento],
    lead.avaliacoes && `${lead.avaliacoes} no Google`,
  ].filter(Boolean);

  return (
    <li className="bg-card rounded-card flex flex-col gap-3 border p-4" data-testid="card-hoje">
      <div className="flex items-start gap-3">
        <SeloPrioridade prioridade={lead.prioridade} />
        <div className="min-w-0 flex-1">
          <Link
            href={ROTAS.lead(lead.id)}
            className="font-titulo text-[17px] leading-snug font-semibold"
          >
            {lead.nome}
          </Link>
          <p className="text-muted-foreground text-sm">
            {[lead.local, lead.telefone].filter(Boolean).join(' · ')}
          </p>
          {detalhes.length > 0 && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              {lead.avaliacoes && <Star className="size-3" aria-hidden />}
              {detalhes.join(' · ')}
            </p>
          )}
        </div>
        {aviso ? (
          <span className="bg-alerta/15 text-alerta rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
            {aviso}
          </span>
        ) : (
          lead.etapa !== 'nao_contatado' && <ChipEtapa etapa={lead.etapa} />
        )}
      </div>

      {chave ? (
        <>
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            aria-expanded={aberto}
            className="bg-muted rounded-control flex items-start gap-2 p-3 text-left text-sm"
          >
            <span className="min-w-0 flex-1">
              <span className="text-muted-foreground block text-xs font-semibold">
                {ROTULO_MODELO[chave]} · toque para {aberto ? 'fechar' : 'ver ou ajustar'}
              </span>
              {!aberto && <span className="mt-0.5 line-clamp-2">{texto}</span>}
            </span>
            <ChevronDown
              className={cn('mt-0.5 size-4 shrink-0 transition-transform', aberto && 'rotate-180')}
              aria-hidden
            />
          </button>
          {aberto && (
            <textarea
              rows={6}
              className={cn(classeCampo, 'h-auto py-2')}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-label="Mensagem"
            />
          )}
          <EnviarWhatsApp leadId={lead.id} chave={chave} texto={texto} whatsapp={lead.whatsapp} />
        </>
      ) : (
        <Link
          href={ROTAS.lead(lead.id)}
          className="rounded-control inline-flex min-h-12 items-center justify-center border px-4 font-semibold"
        >
          Abrir conversa
        </Link>
      )}
    </li>
  );
}
