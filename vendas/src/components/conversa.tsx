'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { classeCampo } from '@/components/campos';
import { cn } from '@/lib/utils';
import { Avaliar } from '@/components/avaliar';
import { Decisao, type PendenteTela } from '@/components/decisao';
import { gerarMensagem, gerarResposta } from '@/server/actions/conversa';

export type MensagemTela = {
  id: string;
  autor: 'lead' | 'gui' | 'conversa';
  texto: string;
  quando: string;
  sugestaoId: string | null;
  avaliacao: 'boa' | 'ruim' | null;
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
  telefoneE164,
  rotuloGerar,
}: {
  leadId: string;
  mensagens: MensagemTela[];
  pendente: PendenteTela | null;
  naoContatar: boolean;
  telefoneE164: string | null;
  /** "Gerar abordagem" ou "Gerar follow-up"; null quando não cabe (ex.: 3 tentativas). */
  rotuloGerar: string | null;
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
            {m.sugestaoId && <Avaliar sugestaoId={m.sugestaoId} avaliacao={m.avaliacao} />}
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={gerando}
              className="bg-primary text-primary-foreground min-h-11 rounded-full px-5 font-semibold disabled:opacity-60"
            >
              {gerando ? 'Gerando… (pode levar até 1 minuto)' : 'Gerar resposta'}
            </button>
            {rotuloGerar && !gerando && (
              <button
                type="button"
                className="rounded-control min-h-11 border px-4 font-semibold"
                title="Sem colar nada: o copiloto escreve a próxima mensagem"
                onClick={() => {
                  setErro(null);
                  iniciar(async () => {
                    const r = await gerarMensagem(leadId);
                    if (!r.ok) return setErro(r.erro);
                    router.refresh();
                  });
                }}
              >
                {rotuloGerar}
              </button>
            )}
          </div>
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
        <Decisao
          key={pendente.id}
          pendente={pendente}
          telefoneE164={telefoneE164}
          aoDecidir={() => router.refresh()}
        />
      )}
    </section>
  );
}
