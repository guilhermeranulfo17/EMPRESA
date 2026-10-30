import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Bloco({
  titulo,
  acao,
  children,
  className,
}: {
  titulo: string
  acao?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-[14px] border border-border bg-[#111] p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-[15px] font-bold tracking-wide text-foreground">{titulo}</h3>
        {acao}
      </div>
      {children}
    </section>
  )
}

export function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-[#7a7a7a]">{rotulo}</dt>
      <dd className="mt-0.5 truncate text-[15px] text-foreground">{children || <span className="text-[#5a5a5a]">Não informado</span>}</dd>
    </div>
  )
}
