'use client';

import { useState, useTransition } from 'react';
import { classeCampo } from '@/components/campos';
import { ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { ROTULO_ANGULO } from '@/domain/vendas/agente';
import { formatData } from '@/domain/dates';
import { testarIa, type ResultadoTeste } from '@/server/actions/ia';

const EXEMPLO = 'Oi, vi sua mensagem. Quanto custa esse sistema?';

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs font-semibold uppercase">{rotulo}</dt>
      <dd className="text-sm whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

/** Cola uma mensagem de lead, chama a IA e mostra a saída validada (ou o erro amigável). */
export function TestarIa() {
  const [texto, setTexto] = useState(EXEMPLO);
  const [resultado, setResultado] = useState<ResultadoTeste | null>(null);
  const [pendente, iniciar] = useTransition();
  return (
    <section className="bg-card rounded-card flex flex-col gap-4 border p-4">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          iniciar(async () => setResultado(await testarIa(texto)));
        }}
      >
        <label htmlFor="mensagem-teste" className="text-sm font-semibold">
          Mensagem do lead
        </label>
        <textarea
          id="mensagem-teste"
          rows={4}
          className={classeCampo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          type="submit"
          disabled={pendente}
          className="bg-primary text-primary-foreground min-h-11 self-start rounded-full px-5 font-semibold disabled:opacity-60"
        >
          {pendente ? 'Gerando…' : 'Testar IA'}
        </button>
      </form>

      {resultado && !resultado.ok && (
        <p
          role="status"
          className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm"
          data-testid="erro-ia"
        >
          {resultado.erro}
        </p>
      )}

      {resultado?.ok && (
        <div className="flex flex-col gap-4" data-testid="resultado-ia">
          <p className="bg-sucesso/10 text-sucesso border-sucesso/30 rounded-control border p-3 text-sm">
            A IA respondeu no formato certo ({resultado.provedor}, {resultado.modelo}, prompt{' '}
            {resultado.promptVersao}).
          </p>
          <div className="bg-muted rounded-control p-3">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              Mensagem sugerida
            </p>
            <p className="mt-1 whitespace-pre-wrap" data-testid="mensagem-ia">
              {resultado.saida.mensagem}
            </p>
          </div>
          <dl className="grid gap-3 md:grid-cols-2">
            <Linha rotulo="Diagnóstico">{resultado.saida.diagnostico}</Linha>
            <Linha rotulo="Resumo">{resultado.saida.resumo}</Linha>
            <Linha rotulo="Etapa">{ROTULO_ETAPA_VENDAS[resultado.saida.etapa]}</Linha>
            <Linha rotulo="Próximo follow-up">
              {resultado.saida.proximo_followup
                ? formatData(resultado.saida.proximo_followup)
                : 'Sem data'}
            </Linha>
            <Linha rotulo="Ângulo">{ROTULO_ANGULO[resultado.saida.angulo]}</Linha>
            <Linha rotulo="Motivo">{resultado.saida.motivo}</Linha>
            <Linha rotulo="Passar para o Gui">
              {resultado.saida.passar_para_humano ? 'Sim' : 'Não'}
            </Linha>
            <Linha rotulo="Não contatar">{resultado.saida.nao_contatar ? 'Sim' : 'Não'}</Linha>
          </dl>
        </div>
      )}
    </section>
  );
}
