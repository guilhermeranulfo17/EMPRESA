import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, FileText, MessagesSquare, Trophy } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatarMoedaCurta } from '@/lib/formatar'
import type { indicadores } from '@/lib/selecoes'

type Dados = ReturnType<typeof indicadores>

function Indicador({
  icone: Icone,
  rotulo,
  valor,
  detalhe,
  destaque = false,
  extra,
  i,
}: {
  icone: LucideIcon
  rotulo: string
  valor: number
  detalhe?: string
  destaque?: boolean
  extra?: React.ReactNode
  i: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * i, duration: 0.3 }}
      className={cn(
        'relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-[var(--radius)] p-5',
        destaque ? 'bg-primary text-white shadow-[0_18px_40px_-20px_rgba(255,90,0,0.7)]' : 'surface',
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'grid size-9 place-items-center rounded-[12px]',
            destaque ? 'bg-white/20 text-white' : 'bg-surface-2 text-ink-2',
          )}
        >
          <Icone className="size-[18px]" aria-hidden />
        </span>
        <span className={cn('text-[13px] font-medium', destaque ? 'text-white/85' : 'text-muted-foreground')}>{rotulo}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-[36px] leading-none font-bold tabular">{valor}</p>
          {detalhe && <p className={cn('mt-1.5 text-xs', destaque ? 'text-white/80' : 'text-muted-foreground')}>{detalhe}</p>}
        </div>
        {extra}
      </div>
    </motion.div>
  )
}

export function Indicadores({ dados }: { dados: Dados }) {
  return (
    <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Indicador
        i={0}
        icone={MessagesSquare}
        rotulo="Contatos na semana"
        valor={dados.contatosSemana}
        detalhe="Ligações e mensagens"
        destaque
        extra={
          <div className="h-10 w-20" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados.contatosPorDia} barCategoryGap={3}>
                <Bar dataKey="total" fill="rgba(255,255,255,0.85)" radius={[3, 3, 3, 3]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
        }
      />
      <Indicador i={1} icone={CalendarCheck} rotulo="Reuniões marcadas" valor={dados.reunioes} detalhe="Empresas em apresentação" />
      <Indicador
        i={2}
        icone={FileText}
        rotulo="Propostas em aberto"
        valor={dados.propostas}
        detalhe={`${formatarMoedaCurta(dados.valorPropostas)} em negociação`}
      />
      <Indicador
        i={3}
        icone={Trophy}
        rotulo="Fechados no mês"
        valor={dados.fechadosMes}
        detalhe={`${formatarMoedaCurta(dados.valorFechadoMes)} em contratos`}
      />
    </section>
  )
}
