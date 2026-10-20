'use client';

import { cn } from '@/lib/utils';

export const classeCampo =
  'h-11 w-full min-w-0 rounded-control border border-input bg-card px-3 text-base outline-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 aria-invalid:border-erro md:text-sm';

/** Rótulo + controle + dica + erro, com os ids ligados para leitores de tela. */
export function Campo({
  id,
  rotulo,
  erro,
  dica,
  className,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  dica?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium', erro && 'text-erro')}>
        {rotulo}
      </label>
      {children}
      {dica && !erro && <p className="text-muted-foreground text-xs">{dica}</p>}
      {erro && (
        <p className="text-erro text-xs" id={`${id}-erro`}>
          {erro}
        </p>
      )}
    </div>
  );
}

/** Caixa de seleção com rótulo clicável e área de toque de 44px. */
export function CampoCheck({
  id,
  rotulo,
  dica,
  ...props
}: { id: string; rotulo: string; dica?: string } & Omit<
  React.ComponentProps<'input'>,
  'type' | 'id'
>) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm">
      <input id={id} type="checkbox" className="accent-primary mt-0.5 size-5 shrink-0" {...props} />
      <span>
        <span className="font-medium">{rotulo}</span>
        {dica && <span className="text-muted-foreground block text-xs">{dica}</span>}
      </span>
    </label>
  );
}
