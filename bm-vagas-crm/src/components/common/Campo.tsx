import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Label + campo + dica, sempre ligados pelo id (acessibilidade). */
export function Campo({
  id,
  label,
  dica,
  children,
  className,
}: {
  id: string
  label: ReactNode
  dica?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {dica && <p className="text-xs text-[#7a7a7a]">{dica}</p>}
    </div>
  )
}
