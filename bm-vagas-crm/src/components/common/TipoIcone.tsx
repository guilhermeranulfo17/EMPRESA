import { CalendarCheck, Mail, NotebookPen, Phone } from 'lucide-react'
import { WhatsAppIcon } from './IconesMarca'
import { cn } from '@/lib/utils'
import type { TipoInteracao } from '@/types'

const ESTILO: Record<TipoInteracao, string> = {
  whatsapp: 'bg-[#25D366]/12 text-[#128C4A] ring-transparent',
  ligacao: 'bg-info/10 text-info-ink ring-transparent',
  email: 'bg-surface-3 text-ink-2 ring-transparent',
  reuniao: 'bg-primary/10 text-primary-ink ring-transparent',
  anotacao: 'bg-warning/15 text-warning-ink ring-transparent',
}

export function IconeTipo({ tipo, className }: { tipo: TipoInteracao; className?: string }) {
  const props = { className: 'size-4' }
  return (
    <span className={cn('grid size-9 shrink-0 place-items-center rounded-full ring-1', ESTILO[tipo], className)} aria-hidden>
      {tipo === 'whatsapp' && <WhatsAppIcon {...props} />}
      {tipo === 'ligacao' && <Phone {...props} />}
      {tipo === 'email' && <Mail {...props} />}
      {tipo === 'reuniao' && <CalendarCheck {...props} />}
      {tipo === 'anotacao' && <NotebookPen {...props} />}
    </span>
  )
}
