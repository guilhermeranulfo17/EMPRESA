import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function CabecalhoPagina({
  titulo,
  subtitulo,
  acoes,
  className,
}: {
  titulo: ReactNode
  subtitulo?: ReactNode
  acoes?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[28px] leading-tight font-bold text-foreground sm:text-[32px]">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-[15px] text-muted-foreground">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
    </header>
  )
}
