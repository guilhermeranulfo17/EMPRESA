import { CalendarCheck, Mail, NotebookPen, Phone } from 'lucide-react'
import { WhatsAppIcon } from './IconesMarca'
import { cn } from '@/lib/utils'
import type { TipoInteracao } from '@/types'

const ESTILO: Record<TipoInteracao, string> = {
  whatsapp: 'bg-[#25D366]/10 text-[#4BE38A] ring-[#25D366]/25',
  ligacao: 'bg-info/10 text-[#60A5FA] ring-info/25',
  email: 'bg-[#A3A3A3]/10 text-[#D4D4D4] ring-white/10',
  reuniao: 'bg-primary/10 text-[#FF8A4C] ring-primary/25',
  anotacao: 'bg-warning/10 text-[#FACC15] ring-warning/25',
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
