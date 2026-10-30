import { CheckCheck, ChevronLeft, Phone, Video } from 'lucide-react'
import { iniciais } from '@/lib/formatar'

/** Pré-visualização realista de uma conversa do WhatsApp (tema escuro). */
export function BalaoWhatsApp({ contato, empresa, texto, horario }: { contato: string; empresa: string; texto: string; horario: string }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#2a2a2a] bg-[#0B141A] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]" aria-label="Pré-visualização no WhatsApp">
      <div className="flex items-center gap-2.5 bg-[#202C33] px-3 py-2.5">
        <ChevronLeft className="size-5 text-[#AEBAC1]" aria-hidden />
        <span className="grid size-9 place-items-center rounded-full bg-[#6A7175] text-[13px] font-bold text-white">{iniciais(contato)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-[#E9EDEF]">{contato}</p>
          <p className="truncate text-xs text-[#8696A0]">{empresa}</p>
        </div>
        <Video className="size-5 text-[#AEBAC1]" aria-hidden />
        <Phone className="ml-3 size-[18px] text-[#AEBAC1]" aria-hidden />
      </div>
      <div
        className="min-h-[260px] px-3 py-4"
        style={{
          backgroundColor: '#0B141A',
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '22px 22px, 13px 13px',
          backgroundPosition: '0 0, 7px 9px',
        }}
      >
        <p className="mx-auto mb-3 w-fit rounded-[8px] bg-[#182229] px-3 py-1 text-[11px] font-medium text-[#8696A0] uppercase">Hoje</p>
        <div className="relative ml-auto w-fit max-w-[88%] rounded-[10px] rounded-tr-[2px] bg-[#005C4B] px-2.5 pt-1.5 pb-1 text-[14.5px] leading-[1.4] text-[#E9EDEF] shadow-sm">
          <span className="absolute top-0 -right-2 size-0 border-t-[10px] border-r-[10px] border-t-[#005C4B] border-r-transparent" aria-hidden />
          <p className="whitespace-pre-wrap">{texto || <span className="text-[#8fb5ab] italic">Escreva o modelo da mensagem…</span>}</p>
          <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-[#8fb5ab]">
            {horario}
            <CheckCheck className="size-4 text-[#53BDEB]" aria-label="Lida" />
          </p>
        </div>
      </div>
    </div>
  )
}
