'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { removerExemplo } from '@/server/actions/exemplos';

export function RemoverExemplo({ sugestaoId }: { sugestaoId: string }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={pendente}
      className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline disabled:opacity-60"
      onClick={() =>
        iniciar(async () => {
          await removerExemplo(sugestaoId);
          router.refresh();
        })
      }
    >
      {pendente ? 'Removendo…' : 'Remover dos exemplos'}
    </button>
  );
}
