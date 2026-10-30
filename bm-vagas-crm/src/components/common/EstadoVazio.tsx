import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function EstadoVazio({
  icone: Icone,
  titulo,
  texto,
  acao,
  className,
}: {
  icone: LucideIcon
  titulo: string
  texto?: string
  acao?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <div className="relative grid size-16 place-items-center rounded-[18px] border border-border bg-surface-2 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <Icone className="size-7" strokeWidth={1.6} />
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">{titulo}</h3>
      {texto && <p className="mt-1.5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{texto}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </motion.div>
  )
}
