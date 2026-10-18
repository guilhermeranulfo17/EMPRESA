import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { RemoverExemplo } from '@/components/remover-exemplo';
import { formatDataHora } from '@/domain/dates';
import { LIMITE_EXEMPLOS } from '@/domain/vendas/exemplos';
import { cn } from '@/lib/utils';
import { exigirGui } from '@/server/guard';
import { listarExemplos, listarParesEditados } from '@/server/vendas/exemplos';

export const metadata: Metadata = { title: 'Exemplos' };
export const dynamic = 'force-dynamic';

export default async function PaginaExemplos() {
  await exigirGui();
  const [exemplos, pares] = await Promise.all([listarExemplos(), listarParesEditados()]);
  if (!exemplos.length && !pares.length) {
    return (
      <EmptyState icone={Star} titulo="Nenhum exemplo marcado">
        Na conversa de um lead, marque as mensagens do copiloto como boas ou ruins (com o motivo em
        uma frase). Quando você edita uma sugestão antes de mandar, a correção também aparece aqui.
        O copiloto usa os mais parecidos em cada nova sugestão.
      </EmptyState>
    );
  }
  const boas = exemplos.filter((e) => e.avaliacao === 'boa').length;
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Exemplos</h2>
        <p className="text-muted-foreground text-sm">
          {boas} {boas === 1 ? 'boa' : 'boas'}, {exemplos.length - boas}{' '}
          {exemplos.length - boas === 1 ? 'ruim' : 'ruins'} e {pares.length}{' '}
          {pares.length === 1 ? 'correção' : 'correções'}. Em cada sugestão o copiloto usa até{' '}
          {LIMITE_EXEMPLOS.bons} boas, {LIMITE_EXEMPLOS.ruins} ruins e {LIMITE_EXEMPLOS.pares}{' '}
          correções, as mais parecidas com a conversa.
        </p>
      </header>

      {exemplos.length > 0 && (
        <section className="flex flex-col gap-2" data-testid="lista-exemplos">
          <h3 className="font-bold">Marcados por você</h3>
          <ul className="grid gap-3 lg:grid-cols-2">
            {exemplos.map((e) => (
              <li
                key={e.sugestaoId}
                className="bg-card rounded-card flex flex-col gap-2 border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      e.avaliacao === 'boa' ? 'bg-sucesso/15 text-sucesso' : 'bg-erro/15 text-erro',
                    )}
                  >
                    {e.avaliacao === 'boa' ? 'Boa' : 'Ruim'}
                  </span>
                  <Link
                    href={`/leads/${e.leadId}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {e.leadNome}
                  </Link>
                </div>
                <p className="text-sm">
                  <b>Por quê:</b> {e.motivo}
                </p>
                <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">
                  {e.mensagem}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs">
                    {formatDataHora(e.criadoEm)}
                  </span>
                  <RemoverExemplo sugestaoId={e.sugestaoId} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pares.length > 0 && (
        <section className="flex flex-col gap-2" data-testid="lista-correcoes">
          <h3 className="font-bold">Suas correções (sugerido → enviado)</h3>
          <ul className="flex flex-col gap-3">
            {pares.map((p) => (
              <li
                key={p.sugestaoId}
                className="bg-card rounded-card grid gap-3 border p-4 md:grid-cols-2"
              >
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase">
                    Copiloto sugeriu
                  </p>
                  <p className="decoration-erro/60 mt-1 text-sm whitespace-pre-wrap line-through">
                    {p.sugerida}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase">
                    Você mandou ·{' '}
                    <Link href={`/leads/${p.leadId}`} className="hover:underline">
                      {p.leadNome}
                    </Link>
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{p.final}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
