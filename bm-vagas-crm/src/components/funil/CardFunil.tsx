import { forwardRef, type HTMLAttributes } from 'react'
import { MapPin } from 'lucide-react'
import { AvatarUsuaria } from '@/components/common/AvatarUsuaria'
import { ServicoTag } from '@/components/common/ServicoTag'
import { DiasParado } from '@/components/common/DiasParado'
import { formatarMoedaCurta } from '@/lib/formatar'
import { estaAtrasado } from '@/lib/selecoes'
import { cn } from '@/lib/utils'
import type { Empresa } from '@/types'

interface Props extends HTMLAttributes<HTMLDivElement> {
  empresa: Empresa
  arrastando?: boolean
  fantasma?: boolean
}

/** Card compacto do kanban. */
export const CardFunil = forwardRef<HTMLDivElement, Props>(function CardFunil(
  { empresa, arrastando = false, fantasma = false, className, ...props },
  ref,
) {
  const atrasado = estaAtrasado(empresa)
  return (
    <div
      ref={ref}
      className={cn(
        'group relative cursor-grab touch-manipulation rounded-[14px] border border-border bg-surface-2 p-4 text-left transition-[transform,box-shadow,border-color,opacity] duration-200 select-none',
        'hover:-translate-y-0.5 hover:border-[#363636] hover:shadow-[var(--shadow-lift)] active:cursor-grabbing',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        fantasma && 'opacity-35',
        arrastando && 'rotate-[2deg] cursor-grabbing border-primary/50 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,90,0,0.25)]',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{empresa.nome}</p>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{empresa.decisor.nome}</p>
        </div>
        <AvatarUsuaria id={empresa.responsavelId} tamanho="sm" />
      </div>
      <div className="mt-2.5 flex items-center gap-1 text-[13px] text-[#8a8a8a]">
        <MapPin className="size-3.5" aria-hidden />
        <span className="truncate">
          {empresa.cidade}/{empresa.uf}
        </span>
        {empresa.valorEstimado > 0 && (
          <span className="ml-auto font-display font-semibold text-[#d4d4d4] tabular">{formatarMoedaCurta(empresa.valorEstimado)}</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {empresa.servicos[0] ? <ServicoTag id={empresa.servicos[0]} /> : <span />}
        <DiasParado desde={empresa.etapaDesde} />
      </div>
      {atrasado && (
        <span className="absolute top-3 -left-px h-6 w-[3px] rounded-r-full bg-danger" title="Contato atrasado" aria-label="Contato atrasado" />
      )}
    </div>
  )
})
