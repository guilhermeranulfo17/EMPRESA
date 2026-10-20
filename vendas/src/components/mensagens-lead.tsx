'use client';

import { useState } from 'react';
import { classeCampo } from '@/components/campos';
import { EnviarWhatsApp } from '@/components/enviar-whatsapp';
import type { Segmento } from '@/domain/vendas/campos';
import {
  CHAVES_MODELO,
  preencherModelo,
  ROTULO_MODELO,
  type ChaveModelo,
} from '@/domain/vendas/modelos';
import { cn } from '@/lib/utils';

/** No lead: escolhe um dos 5 modelos, ajusta se quiser e manda pelo WhatsApp. */
export function MensagensLead({
  lead,
  modelos,
  sugerido,
}: {
  lead: {
    id: string;
    nome: string;
    cidade: string | null;
    segmento: Segmento | null;
    whatsapp: string | null;
  };
  modelos: Record<ChaveModelo, string>;
  sugerido: ChaveModelo;
}) {
  const preencher = (c: ChaveModelo) => preencherModelo(modelos[c], lead);
  const [chave, setChave] = useState<ChaveModelo>(sugerido);
  const [texto, setTexto] = useState(() => preencher(sugerido));

  return (
    <section
      className="bg-card rounded-card flex flex-col gap-3 border p-4"
      data-testid="mensagens-lead"
    >
      <h2 className="text-lg font-bold">Mandar mensagem</h2>
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {CHAVES_MODELO.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === chave}
              onClick={() => {
                setChave(c);
                setTexto(preencher(c));
              }}
              className={cn(
                'min-h-10 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap',
                c === chave
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'text-muted-foreground',
              )}
            >
              {ROTULO_MODELO[c]}
            </button>
          ))}
        </div>
      </div>
      <textarea
        rows={5}
        aria-label="Mensagem"
        className={cn(classeCampo, 'h-auto py-2')}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        data-testid="texto-modelo"
      />
      <EnviarWhatsApp
        key={chave}
        leadId={lead.id}
        chave={chave}
        texto={texto}
        whatsapp={lead.whatsapp}
      />
    </section>
  );
}
