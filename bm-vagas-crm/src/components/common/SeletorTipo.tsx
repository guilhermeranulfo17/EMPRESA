import { CalendarCheck, Mail, NotebookPen, Phone } from 'lucide-react'
import { WhatsAppIcon } from './IconesMarca'
import { TIPOS_INTERACAO } from '@/lib/constantes'
import { cn } from '@/lib/utils'
import type { TipoInteracao } from '@/types'

const ICONE = {
  whatsapp: WhatsAppIcon,
  ligacao: Phone,
  email: Mail,
  reuniao: CalendarCheck,
  anotacao: NotebookPen,
} as const

/** Escolha do tipo de contato com ícones grandes. */
export function SeletorTipo({
  valor,
  onChange,
  compacto = false,
}: {
  valor: TipoInteracao
  onChange: (t: TipoInteracao) => void
  compacto?: boolean
}) {
  return (
    <div role="radiogroup" aria-label="Tipo de contato" className="grid grid-cols-5 gap-1.5">
      {TIPOS_INTERACAO.map(({ id, nome }) => {
        const Icone = ICONE[id]
        const ativo = valor === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={nome}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-[12px] border font-semibold transition-all',
              compacto ? 'h-12 text-[11px]' : 'h-16 text-xs',
              ativo
                ? 'border-primary bg-primary/10 text-primary-ink'
                : 'border-transparent bg-surface-2 text-muted-foreground hover:border-border-strong hover:text-foreground',
            )}
          >
            <Icone className={cn(compacto ? 'size-4' : 'size-5', ativo && 'text-primary')} />
            {nome}
          </button>
        )
      })}
    </div>
  )
}
