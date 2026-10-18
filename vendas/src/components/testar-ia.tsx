'use client';

import { useState, useTransition } from 'react';
import { classeCampo } from '@/components/campos';
import { SaidaCopiloto } from '@/components/saida-copiloto';
import { testarIa, type ResultadoTeste } from '@/server/actions/ia';

const EXEMPLO = 'Oi, vi sua mensagem. Quanto custa esse sistema?';

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
          <SaidaCopiloto saida={resultado.saida} />
        </div>
      )}
    </section>
  );
}
