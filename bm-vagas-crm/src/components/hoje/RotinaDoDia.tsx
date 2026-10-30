import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { api } from '@/services'
import { hojeISO } from '@/lib/datas'
import { cn } from '@/lib/utils'
import type { RotinaDoDia as Rotina, RotinaItemId } from '@/types'

const ITENS: { id: RotinaItemId; titulo: string; dica: string }[] = [
  { id: 'revisar', titulo: 'Revisar os contatos do dia', dica: 'Ler a lista e ver quem é prioridade' },
  { id: 'registrar', titulo: 'Registrar as conversas', dica: 'Apertar "Feito" depois de cada contato' },
  { id: 'mover', titulo: 'Mover os cards no funil', dica: 'Quem avançou muda de coluna' },
  { id: 'novas', titulo: 'Conferir as novas empresas da semana', dica: 'O que o Rafael encontrou' },
]

export function RotinaDoDia() {
  const dia = hojeISO()
  const [rotina, setRotina] = useState<Rotina | null>(null)

  useEffect(() => {
    void api.rotina.obter(dia).then(setRotina)
  }, [dia])

  const feitos = rotina ? ITENS.filter((i) => rotina[i.id]).length : 0

  async function alternar(id: RotinaItemId) {
    if (!rotina) return
    setRotina({ ...rotina, [id]: !rotina[id] })
    setRotina(await api.rotina.marcar(dia, id, !rotina[id]))
  }

  return (
    <section className="surface p-5 sm:p-6" aria-labelledby="titulo-rotina">
      <div className="flex items-center justify-between">
        <h2 id="titulo-rotina" className="font-display text-lg font-bold">
          Rotina do dia
        </h2>
        <span className="font-display text-sm font-bold text-muted-foreground tabular">
          <span className={cn(feitos === ITENS.length && 'text-success')}>{feitos}</span>/{ITENS.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#202020]">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${(feitos / ITENS.length) * 100}%`, backgroundColor: feitos === ITENS.length ? '#22C55E' : '#FF5A00' }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>
      <ul className="mt-4 flex flex-col gap-1">
        {ITENS.map((item) => {
          const feito = !!rotina?.[item.id]
          return (
            <li key={item.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={feito}
                onClick={() => alternar(item.id)}
                className="flex w-full items-start gap-3 rounded-[12px] p-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <span
                  className={cn(
                    'mt-0.5 grid size-6 shrink-0 place-items-center rounded-[8px] border transition-all duration-200',
                    feito ? 'border-success bg-success text-black' : 'border-[#3a3a3a] bg-[#101010]',
                  )}
                >
                  <motion.span initial={false} animate={{ scale: feito ? 1 : 0 }} transition={{ type: 'spring', stiffness: 600, damping: 25 }}>
                    <Check className="size-4" strokeWidth={3} />
                  </motion.span>
                </span>
                <span className="min-w-0">
                  <span className={cn('block text-[15px] font-semibold transition-colors', feito ? 'text-[#6b6b6b] line-through' : 'text-foreground')}>
                    {item.titulo}
                  </span>
                  <span className="block text-[13px] text-[#7a7a7a]">{item.dica}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
