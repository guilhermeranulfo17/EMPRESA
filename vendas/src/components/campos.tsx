'use client';

import { mascaraTelefoneBR } from '@/domain/mascara';
import { formatPhoneBR } from '@/domain/phone';
import { cn } from '@/lib/utils';

export const classeCampo =
  'h-11 w-full min-w-0 rounded-control border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-erro md:text-sm';

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

/** Telefone com máscara BR; mostra um E.164 salvo já formatado (o servidor converte de volta). */
export function CampoTelefone({
  id,
  valor,
  onChange,
  invalido,
}: {
  id: string;
  valor: string;
  onChange: (texto: string) => void;
  invalido?: boolean;
}) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="(34) 99135-5450"
      aria-invalid={invalido || undefined}
      className={classeCampo}
      value={valor.startsWith('+55') ? formatPhoneBR(valor) : valor}
      onChange={(e) => onChange(mascaraTelefoneBR(e.target.value))}
    />
  );
}
