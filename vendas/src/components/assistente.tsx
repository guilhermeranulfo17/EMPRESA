'use client';

import { MessageCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Campo, classeCampo } from '@/components/campos';
import { BOTAO_PRINCIPAL, BOTAO_SECUNDARIO, linkComTexto } from '@/components/enviar-whatsapp';
import type { SaidaAgente } from '@/domain/vendas/agente';
import { ETAPAS_VENDAS, ROTULO_ETAPA_VENDAS, type EtapaVendas } from '@/domain/vendas/etapas';
import { cn } from '@/lib/utils';
import { aceitarSugestao, analisarConversa, recusarSugestao } from '@/server/actions/conversa';

export type PendenteTela = { id: string; entrada: string; saida: SaidaAgente };

const AVISO_ERRO = 'bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm';

/**
 * Assistente de IA do lead: cola a conversa do WhatsApp, a IA devolve resumo, etapa, próxima
 * resposta e data do follow-up. Você aceita, edita ou recusa.
 */
export function Assistente({
  leadId,
  pendente,
  whatsapp,
  naoContatar,
}: {
  leadId: string;
  pendente: PendenteTela | null;
  whatsapp: string | null;
  naoContatar: boolean;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [analisando, iniciar] = useTransition();

  return (
    <section
      className="bg-card rounded-card flex flex-col gap-4 border p-4"
      data-testid="assistente"
    >
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Sparkles className="text-primary size-5" aria-hidden /> Assistente de IA
      </h2>
      {naoContatar && (
        <p className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm">
          Esse lead pediu para não ser contatado.
        </p>
      )}
      {pendente ? (
        <Sugestao
          key={pendente.id}
          pendente={pendente}
          whatsapp={whatsapp}
          aoDecidir={() => router.refresh()}
        />
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setErro(null);
            iniciar(async () => {
              const r = await analisarConversa(leadId, texto);
              if (!r.ok) return setErro(r.erro);
              setTexto('');
              router.refresh();
            });
          }}
        >
          <label htmlFor="conversa" className="text-muted-foreground text-sm">
            Cole aqui a conversa do WhatsApp (no WhatsApp: segure a mensagem, selecione as outras e
            copie).
          </label>
          <textarea
            id="conversa"
            rows={6}
            className={cn(classeCampo, 'h-auto py-2')}
            placeholder="[10:32] Buffet Alegria: Oi, quanto custa?"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit" disabled={analisando || !texto.trim()} className={BOTAO_PRINCIPAL}>
            {analisando ? 'Analisando… (até 1 minuto)' : 'Analisar com IA'}
          </button>
          {erro && (
            <p role="status" className={AVISO_ERRO} data-testid="erro-assistente">
              {erro}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

function Sugestao({
  pendente,
  whatsapp,
  aoDecidir,
}: {
  pendente: PendenteTela;
  whatsapp: string | null;
  aoDecidir: () => void;
}) {
  const s = pendente.saida;
  const [mensagem, setMensagem] = useState(s.mensagem);
  const [etapa, setEtapa] = useState<EtapaVendas>(s.etapa);
  const [data, setData] = useState(s.proximo_followup);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  // mesma regra de foiEditada (domain/vendas/decisao), sem levar o zod para o navegador
  const editada = s.mensagem.trim() !== mensagem.trim();

  function aceitar() {
    setErro(null);
    iniciar(async () => {
      const r = await aceitarSugestao(pendente.id, { mensagem, etapa, proximoFollowup: data });
      if (!r.ok) return setErro(r.campos ? Object.values(r.campos)[0]! : r.erro);
      aoDecidir();
    });
  }

  return (
    <div className="flex flex-col gap-4" data-testid="sugestao">
      {s.nao_contatar && (
        <p className={cn(AVISO_ERRO, 'font-semibold')} data-testid="aviso-nao-contatar">
          O lead pediu para parar. Responda com educação e não mande mais nada.
        </p>
      )}
      <div>
        <p className="text-muted-foreground text-xs font-semibold uppercase">Resumo</p>
        <p className="mt-1 text-sm" data-testid="resumo-ia">
          {s.resumo}
        </p>
      </div>
      <Campo id="mensagem-ia" rotulo="Próxima resposta (pode editar)">
        <textarea
          id="mensagem-ia"
          rows={5}
          className={cn(classeCampo, 'h-auto py-2')}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          data-testid="mensagem-ia"
        />
      </Campo>
      {editada && (
        <p className="text-muted-foreground -mt-2 text-xs" data-testid="aviso-editada">
          Editada. A versão da IA e a sua ficam guardadas para ela aprender o seu jeito.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Campo id="etapa-ia" rotulo="Etapa sugerida">
          <select
            id="etapa-ia"
            className={classeCampo}
            value={etapa}
            onChange={(e) => setEtapa(e.target.value as EtapaVendas)}
            data-testid="etapa-ia"
          >
            {ETAPAS_VENDAS.map((e) => (
              <option key={e} value={e}>
                {ROTULO_ETAPA_VENDAS[e]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="data-ia" rotulo="Próximo follow-up">
          <input
            id="data-ia"
            type="date"
            className={classeCampo}
            value={data}
            onChange={(e) => setData(e.target.value)}
            data-testid="data-ia"
          />
        </Campo>
      </div>
      {s.motivo && <p className="text-muted-foreground text-xs">Por quê: {s.motivo}</p>}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {whatsapp && (
          <a
            href={mensagem.trim() ? linkComTexto(whatsapp, mensagem.trim()) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(BOTAO_PRINCIPAL, salvando && 'pointer-events-none opacity-60')}
            data-testid="aceitar-whatsapp"
            onClick={aceitar}
          >
            <MessageCircle className="size-5" aria-hidden />
            Aceitar e abrir no WhatsApp
          </a>
        )}
        <button
          type="button"
          disabled={salvando}
          className={whatsapp ? BOTAO_SECUNDARIO : BOTAO_PRINCIPAL}
          onClick={aceitar}
          data-testid="aceitar"
        >
          {whatsapp ? 'Só aceitar' : 'Aceitar'}
        </button>
        <button
          type="button"
          disabled={salvando}
          className={BOTAO_SECUNDARIO}
          data-testid="recusar"
          onClick={() => {
            setErro(null);
            iniciar(async () => {
              const r = await recusarSugestao(pendente.id);
              if (!r.ok) return setErro(r.erro);
              aoDecidir();
            });
          }}
        >
          Recusar
        </button>
      </div>
      {erro && (
        <p role="status" className={AVISO_ERRO} data-testid="erro-decisao">
          {erro}
        </p>
      )}
      <details className="text-muted-foreground text-xs">
        <summary className="cursor-pointer">Conversa analisada</summary>
        <p className="mt-2 whitespace-pre-wrap">{pendente.entrada}</p>
      </details>
    </div>
  );
}
