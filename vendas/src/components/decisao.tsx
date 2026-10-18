'use client';

import { useState, useTransition } from 'react';
import { classeCampo } from '@/components/campos';
import { SaidaCopiloto } from '@/components/saida-copiloto';
import type { SaidaAgente } from '@/domain/vendas/agente';
import { foiEditada, linkWhatsApp } from '@/domain/vendas/decisao';
import { aprovarSugestao, descartarSugestao } from '@/server/actions/conversa';

export type PendenteTela = {
  id: string;
  tipo: 'resposta' | 'abordagem' | 'followup';
  entrada: string;
  saida: SaidaAgente;
};

const TITULO_TIPO = {
  resposta: 'Você colou',
  abordagem: 'Primeira abordagem',
  followup: 'Follow-up (lead sem responder)',
} as const;

const BOTAO =
  'bg-primary text-primary-foreground min-h-11 rounded-full px-5 font-semibold disabled:opacity-60';
const BOTAO_SECUNDARIO = 'rounded-control min-h-11 border px-4 font-semibold disabled:opacity-60';

/** A sugestão pendente: editar o texto, aprovar (abrindo ou não o WhatsApp) ou descartar. */
export function Decisao({
  pendente,
  telefoneE164,
  aoDecidir,
}: {
  pendente: PendenteTela;
  telefoneE164: string | null;
  aoDecidir: () => void;
}) {
  const [texto, setTexto] = useState(pendente.saida.mensagem);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const editada = foiEditada(pendente.saida.mensagem, texto);
  const link = linkWhatsApp(telefoneE164, texto.trim());

  function aprovar(abrir: boolean) {
    setErro(null);
    // abre já no clique (senão o navegador bloqueia a nova aba)
    if (abrir && link) window.open(link, '_blank', 'noopener');
    iniciar(async () => {
      const r = await aprovarSugestao(pendente.id, texto);
      if (!r.ok) return setErro(r.erro);
      aoDecidir();
    });
  }

  return (
    <div className="bg-card rounded-card flex flex-col gap-4 border p-4" data-testid="sugestao">
      {pendente.tipo === 'resposta' ? (
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase">
            {TITULO_TIPO.resposta}
          </p>
          <p className="text-muted-foreground mt-1 line-clamp-4 text-sm whitespace-pre-wrap">
            {pendente.entrada}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs font-semibold uppercase">
          {TITULO_TIPO[pendente.tipo]}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="mensagem-final" className="text-sm font-semibold">
          Mensagem sugerida{' '}
          <span className="text-muted-foreground font-normal">(pode editar antes de enviar)</span>
        </label>
        <textarea
          id="mensagem-final"
          rows={4}
          className={classeCampo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          data-testid="mensagem-ia"
        />
        {editada && (
          <p className="text-muted-foreground text-xs" data-testid="aviso-editada">
            Você editou a mensagem. A versão original fica guardada para o copiloto aprender.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {link ? (
          <button type="button" className={BOTAO} disabled={salvando} onClick={() => aprovar(true)}>
            Aprovar e abrir no WhatsApp
          </button>
        ) : (
          <p className="text-muted-foreground w-full text-xs">
            Sem telefone cadastrado: copie a mensagem e envie por onde preferir.
          </p>
        )}
        <button
          type="button"
          className={link ? BOTAO_SECUNDARIO : BOTAO}
          disabled={salvando}
          onClick={() => aprovar(false)}
        >
          {link ? 'Só aprovar' : 'Aprovar'}
        </button>
        <button
          type="button"
          className={BOTAO_SECUNDARIO}
          disabled={salvando}
          onClick={() => {
            setErro(null);
            iniciar(async () => {
              const r = await descartarSugestao(pendente.id);
              if (!r.ok) return setErro(r.erro);
              aoDecidir();
            });
          }}
        >
          Descartar
        </button>
      </div>
      {erro && (
        <p
          role="status"
          className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm"
          data-testid="erro-decisao"
        >
          {erro}
        </p>
      )}
      <SaidaCopiloto saida={pendente.saida} semMensagem />
    </div>
  );
}
