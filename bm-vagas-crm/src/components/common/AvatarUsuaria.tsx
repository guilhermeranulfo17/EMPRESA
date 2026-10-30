import { useCrm } from '@/store/CrmProvider'
import { cn } from '@/lib/utils'
import type { UsuariaId } from '@/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const ESTILO: Record<UsuariaId, string> = {
  rosali: 'bg-[#E8EEFB] text-[#1D4ED8] ring-transparent',
  marlete: 'bg-[#FFEBDD] text-[#C24600] ring-transparent',
}

export function AvatarUsuaria({
  id,
  tamanho = 'md',
  comDica = true,
  className,
}: {
  id: UsuariaId
  tamanho?: 'sm' | 'md' | 'lg'
  comDica?: boolean
  className?: string
}) {
  const { config } = useCrm()
  const usuaria = config.usuarias.find((u) => u.id === id)
  const nome = usuaria?.nome ?? id
  const avatar = (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-display font-bold ring-1',
        ESTILO[id],
        tamanho === 'sm' && 'size-6 text-[11px]',
        tamanho === 'md' && 'size-8 text-[13px]',
        tamanho === 'lg' && 'size-11 text-base',
        className,
      )}
      aria-label={`Responsável: ${nome}`}
      role="img"
    >
      {nome.charAt(0).toUpperCase()}
    </span>
  )
  if (!comDica) return avatar
  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>{nome}</TooltipContent>
    </Tooltip>
  )
}
