'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { classeCampo } from '@/components/campos';
import { cn } from '@/lib/utils';
import { marcarExemplo } from '@/server/actions/exemplos';

/**
 * Avaliar uma mensagem do copiloto: boa ou ruim, com o motivo em uma frase. Vira exemplo que o
 * copiloto usa nas próximas sugestões.
 */
export function Avaliar({
  sugestaoId,
  avaliacao,
}: {
  sugestaoId: string;
  avaliacao: 'boa' | 'ruim' | null;
}) {
  const router = useRouter();
  const [escolha, setEscolha] = useState<'boa' | 'ruim' | null>(null);
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  if (!escolha) {
    return (
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs" data-testid="avaliar">
        {avaliacao && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-semibold',
              avaliacao === 'boa' ? 'bg-sucesso/15 text-sucesso' : 'bg-erro/15 text-erro',
            )}
          >
            {avaliacao === 'boa' ? 'Exemplo bom' : 'Exemplo ruim'}
          </span>
        )}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          onClick={() => setEscolha('boa')}
        >
          {avaliacao ? 'Trocar' : 'Marcar como boa'}
        </button>
        {!avaliacao && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            onClick={() => setEscolha('ruim')}
          >
            Marcar como ruim
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      className="mt-2 flex flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        iniciar(async () => {
          const r = await marcarExemplo(sugestaoId, escolha, motivo);
          if (!r.ok) return setErro(r.erro);
          setEscolha(null);
          setMotivo('');
          router.refresh();
        });
      }}
    >
      <div className="flex gap-1.5 text-xs">
        {(['boa', 'ruim'] as const).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setEscolha(op)}
            className={cn(
              'rounded-full border px-2.5 py-1 font-semibold',
              escolha === op &&
                (op === 'boa' ? 'bg-sucesso/15 text-sucesso' : 'bg-erro/15 text-erro'),
            )}
          >
            {op === 'boa' ? 'Boa' : 'Ruim'}
          </button>
        ))}
      </div>
      <input
        className={cn(classeCampo, 'min-h-9 text-sm')}
        placeholder="Por quê? Uma frase (ex.: curta e fez pergunta certa)"
        aria-label="Motivo da avaliação"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2 text-sm">
        <button type="submit" disabled={salvando} className="text-primary font-semibold">
          {salvando ? 'Salvando…' : 'Salvar avaliação'}
        </button>
        <button type="button" className="text-muted-foreground" onClick={() => setEscolha(null)}>
          Cancelar
        </button>
      </div>
      {erro && <p className="text-erro text-xs">{erro}</p>}
    </form>
  );
}
