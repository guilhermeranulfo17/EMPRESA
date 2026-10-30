import { Clock } from 'lucide-react'
import { diasDesde } from '@/lib/datas'
import { cn } from '@/lib/utils'

/** Dias parado na etapa: amarelo a partir de 5 dias, vermelho a partir de 10. */
export function nivelParado(dias: number) {
  if (dias >= 10) return 'vermelho'
  if (dias >= 5) return 'amarelo'
  return 'normal'
}

export function DiasParado({ desde, className }: { desde: string | null; className?: string }) {
  if (!desde) return null
  const dias = diasDesde(desde)
  const nivel = nivelParado(dias)
  const texto = dias === 0 ? 'Hoje' : dias === 1 ? '1 dia' : `${dias} dias`
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular',
        nivel === 'normal' && 'text-muted-foreground',
        nivel === 'amarelo' && 'bg-warning/10 text-[#FACC15]',
        nivel === 'vermelho' && 'bg-danger/12 text-[#F87171]',
        className,
      )}
      title={`Parada nesta etapa há ${texto.toLowerCase()}`}
    >
      <Clock className="size-3.5" aria-hidden />
      <span className="sr-only">Parada há </span>
      {texto}
    </span>
  )
}
