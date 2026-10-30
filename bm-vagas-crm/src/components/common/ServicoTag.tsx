import { COR_SERVICO, SERVICO_POR_ID } from '@/lib/constantes'
import { cn } from '@/lib/utils'
import type { ServicoId } from '@/types'

export function ServicoTag({ id, longo = false, className }: { id: ServicoId; longo?: boolean; className?: string }) {
  const cor = COR_SERVICO[id]
  const servico = SERVICO_POR_ID[id]
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', className)}
      style={{ color: cor.texto, backgroundColor: cor.fundo, borderColor: cor.borda }}
    >
      {longo ? servico.nome : servico.curto}
    </span>
  )
}
