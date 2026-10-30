import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, FileText, MessagesSquare, Trophy } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
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
      className="surface relative flex min-h-[112px] flex-col justify-between overflow-hidden p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
        <Icone className="size-4" aria-hidden />
        <span>{rotulo}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className={`font-display text-[34px] leading-none font-bold tabular ${destaque ? 'text-primary' : 'text-foreground'}`}>
            {valor}
          </p>
          {detalhe && <p className="mt-1.5 text-xs text-[#7a7a7a]">{detalhe}</p>}
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
        destaque
        extra={
          <div className="h-10 w-20" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados.contatosPorDia} barCategoryGap={3}>
                <Bar dataKey="total" fill="#FF5A00" radius={[3, 3, 0, 0]} isAnimationActive />
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
