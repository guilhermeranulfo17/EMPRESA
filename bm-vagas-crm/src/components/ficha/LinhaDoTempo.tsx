import { History } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconeTipo } from '@/components/common/TipoIcone'
import { Bloco } from './Bloco'
import { useCrm } from '@/store/CrmProvider'
import { NOME_TIPO_INTERACAO } from '@/lib/constantes'
import { dataHora } from '@/lib/datas'
import type { Interacao } from '@/types'

export function LinhaDoTempo({ interacoes }: { interacoes: Interacao[] }) {
  const { config } = useCrm()
  return (
    <Bloco titulo="Linha do tempo">
      {interacoes.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <History className="size-7 text-subtle" strokeWidth={1.6} />
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma conversa registrada ainda.</p>
          <p className="text-[13px] text-muted-foreground">Use o campo aqui embaixo para registrar a primeira.</p>
        </div>
      ) : (
        <ol className="relative">
          <AnimatePresence initial={false}>
            {interacoes.map((i, idx) => (
              <motion.li
                key={i.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex gap-3.5 pb-5 last:pb-0"
              >
                {idx < interacoes.length - 1 && <span className="absolute top-10 bottom-0 left-[17px] w-px bg-border" aria-hidden />}
                <IconeTipo tipo={i.tipo} />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[13px] text-muted-foreground">
                    <span className="font-semibold text-ink-2">{NOME_TIPO_INTERACAO[i.tipo]}</span> · {dataHora(i.data)} ·{' '}
                    {config.usuarias.find((u) => u.id === i.autoraId)?.nome}
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-foreground">{i.texto}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </Bloco>
  )
}
