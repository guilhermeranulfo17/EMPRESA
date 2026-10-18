'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { classeCampo } from '@/components/campos';
import { SaidaCopiloto } from '@/components/saida-copiloto';
import type { SaidaAgente } from '@/domain/vendas/agente';
import { cn } from '@/lib/utils';
import { gerarResposta } from '@/server/actions/conversa';

export type MensagemTela = {
  id: string;
  autor: 'lead' | 'gui' | 'conversa';
  texto: string;
  quando: string;
};

const ROTULO = { lead: 'Lead', gui: 'Você', conversa: 'Conversa colada' } as const;

/**
 * Conversa do lead: histórico, campo para colar o que o lead respondeu e "Gerar resposta".
 * A sugestão fica guardada como pendente até você decidir o que fazer com ela.
 */
export function Conversa({
  leadId,
  mensagens,
  pendente,
  naoContatar,
}: {
  leadId: string;
  mensagens: MensagemTela[];
  pendente: { entrada: string; saida: SaidaAgente } | null;
  naoContatar: boolean;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, iniciar] = useTransition();

  return (
    <section className="flex flex-col gap-4" data-testid="conversa">
      <h3 className="font-bold">Conversa</h3>

      <ol className="bg-card rounded-card flex flex-col gap-2 border p-3" data-testid="historico">
        {mensagens.length === 0 && (
          <li className="text-muted-foreground p-2 text-sm">
            Nenhuma mensagem registrada ainda. Cole abaixo a resposta do lead ou a conversa inteira.
          </li>
        )}
        {mensagens.map((m) => (
          <li
            key={m.id}
            className={cn(
              'rounded-control max-w-[85%] p-2.5 text-sm',
              m.autor === 'gui' ? 'bg-primary/15 self-end' : 'bg-muted self-start',
            )}
          >
            <p className="text-muted-foreground text-xs font-semibold">
              {ROTULO[m.autor]} · {m.quando}
            </p>
            <p className="mt-0.5 whitespace-pre-wrap">{m.texto}</p>
          </li>
        ))}
      </ol>

      {naoContatar ? (
        <p className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm">
          Esse lead está marcado como “não contatar”. O copiloto não gera mensagens para ele.
        </p>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setErro(null);
            iniciar(async () => {
              const r = await gerarResposta(leadId, texto);
              if (!r.ok) {
                setErro(r.erro);
                return;
              }
              setTexto('');
              router.refresh();
            });
          }}
        >
          <label htmlFor="entrada-conversa" className="text-sm font-semibold">
            O que o lead respondeu
          </label>
          <textarea
            id="entrada-conversa"
            rows={5}
            className={classeCampo}
            placeholder="Cole aqui a resposta do lead (ou a conversa inteira do WhatsApp)"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button
            type="submit"
            disabled={gerando}
            className="bg-primary text-primary-foreground min-h-11 self-start rounded-full px-5 font-semibold disabled:opacity-60"
          >
            {gerando ? 'Gerando… (pode levar até 1 minuto)' : 'Gerar resposta'}
          </button>
          {erro && (
            <p
              role="status"
              className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm"
              data-testid="erro-conversa"
            >
              {erro}
            </p>
          )}
        </form>
      )}

      {pendente && (
        <div className="bg-card rounded-card flex flex-col gap-3 border p-4" data-testid="sugestao">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase">Você colou</p>
            <p className="text-muted-foreground mt-1 line-clamp-4 text-sm whitespace-pre-wrap">
              {pendente.entrada}
            </p>
          </div>
          <SaidaCopiloto saida={pendente.saida} />
          <p className="text-muted-foreground text-xs">
            Aprovar, editar, descartar e abrir no WhatsApp chegam na próxima etapa.
          </p>
        </div>
      )}
    </section>
  );
}
