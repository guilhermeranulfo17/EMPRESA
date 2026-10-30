import { useId } from 'react'
import { addDays } from 'date-fns'
import { diaISO, hojeISO } from '@/lib/datas'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import type { ProximoContatoAtalho } from '@/types'

const OPCOES: { id: ProximoContatoAtalho; nome: string; dias?: number }[] = [
  { id: 'amanha', nome: 'Amanhã', dias: 1 },
  { id: '3dias', nome: '3 dias', dias: 3 },
  { id: '1semana', nome: '1 semana', dias: 7 },
  { id: 'data', nome: 'Escolher data' },
]

export interface ValorProximoContato {
  atalho: ProximoContatoAtalho | 'nenhum'
  data: string
}

export function valorPadraoProximo(): ValorProximoContato {
  return { atalho: '3dias', data: diaISO(addDays(new Date(), 3)) }
}

/** Converte a escolha em yyyy-MM-dd (ou null para "sem próximo contato"). */
export function resolverProximo(v: ValorProximoContato): string | null {
  if (v.atalho === 'nenhum') return null
  const op = OPCOES.find((o) => o.id === v.atalho)
  if (op?.dias) return diaISO(addDays(new Date(), op.dias))
  return v.data || null
}

export function EscolhaProximoContato({
  valor,
  onChange,
  permitirNenhum = false,
  legenda = 'Quando falar de novo?',
}: {
  valor: ValorProximoContato
  onChange: (v: ValorProximoContato) => void
  permitirNenhum?: boolean
  legenda?: string
}) {
  const idData = useId()
  const opcoes = permitirNenhum ? [...OPCOES, { id: 'nenhum' as const, nome: 'Sem data' }] : OPCOES
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[13px] font-medium text-muted-foreground">{legenda}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
        {opcoes.map((op) => {
          const ativo = valor.atalho === op.id
          return (
            <button
              key={op.id}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => onChange({ ...valor, atalho: op.id })}
              className={cn(
                'h-11 rounded-[12px] border text-sm font-semibold transition-all',
                ativo
                  ? 'border-primary bg-primary/10 text-primary-ink shadow-[0_0_0_1px_rgba(255,90,0,0.4)]'
                  : 'border-transparent bg-surface-2 text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {op.nome}
            </button>
          )
        })}
      </div>
      {valor.atalho === 'data' && (
        <div className="mt-1">
          <label htmlFor={idData} className="sr-only">
            Data do próximo contato
          </label>
          <Input
            id={idData}
            type="date"
            min={hojeISO()}
            value={valor.data}
            onChange={(e) => onChange({ ...valor, data: e.target.value })}
          />
        </div>
      )}
    </fieldset>
  )
}
