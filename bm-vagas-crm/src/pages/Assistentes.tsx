import { ShieldAlert } from 'lucide-react'
import { Pagina } from '@/components/common/Pagina'
import { CabecalhoPagina } from '@/components/common/CabecalhoPagina'
import { EsqueletoCards } from '@/components/common/Esqueletos'
import { CardLivia } from '@/components/assistentes/CardLivia'
import { CardRafael } from '@/components/assistentes/CardRafael'
import { useCrm } from '@/store/CrmProvider'
import type { AssistenteLivia, AssistenteRafael } from '@/types'

export default function Assistentes() {
  const { carregando, assistentes } = useCrm()
  const livia = assistentes.find((a): a is AssistenteLivia => a.id === 'livia')
  const rafael = assistentes.find((a): a is AssistenteRafael => a.id === 'rafael')

  return (
    <Pagina>
      <CabecalhoPagina titulo="Assistentes" subtitulo="Eles cuidam do trabalho repetitivo para vocês focarem nas conversas." />

      <p className="mt-5 flex items-start gap-2.5 rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#FACC15]" aria-hidden />
        <span>
          Use um número de WhatsApp exclusivo para prospecção. Nesta versão, os assistentes ainda não enviam mensagens de verdade.
        </span>
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {carregando ? (
          <EsqueletoCards />
        ) : (
          <>
            {livia && <CardLivia livia={livia} />}
            {rafael && <CardRafael rafael={rafael} />}
          </>
        )}
      </div>
    </Pagina>
  )
}
