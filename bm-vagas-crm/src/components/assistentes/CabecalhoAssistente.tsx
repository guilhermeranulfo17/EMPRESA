import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export function CabecalhoAssistente({
  inicial,
  nome,
  funcao,
  ativo,
  onAtivo,
  resumo,
}: {
  inicial: string
  nome: string
  funcao: string
  ativo: boolean
  onAtivo: (v: boolean) => void
  resumo: ReactNode
}) {
  const idSwitch = `ativo-${nome}`
  return (
    <div className="flex flex-col gap-5 border-b border-border p-5 sm:flex-row sm:items-center sm:p-7">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative">
          <span
            className={cn(
              'grid size-16 place-items-center rounded-[18px] border font-display text-2xl font-black transition-colors',
              ativo ? 'border-primary/40 bg-[#2a1407] text-primary' : 'border-border bg-surface-2 text-[#6b6b6b]',
            )}
            aria-hidden
          >
            {inicial}
          </span>
          {ativo && (
            <span className="absolute -right-1 -bottom-1 flex size-4" aria-hidden>
              <motion.span
                className="absolute inline-flex size-full rounded-full bg-success"
                animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="relative inline-flex size-4 rounded-full border-2 border-surface bg-success" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold">{nome}</h2>
          <p className="text-[15px] text-muted-foreground">{funcao}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
        <div className="flex items-center gap-3">
          <label htmlFor={idSwitch} className={cn('text-sm font-semibold', ativo ? 'text-[#4ADE80]' : 'text-muted-foreground')}>
            {ativo ? 'Ativo' : 'Pausado'}
          </label>
          <Switch id={idSwitch} checked={ativo} onCheckedChange={onAtivo} />
        </div>
        <p className="text-sm text-muted-foreground sm:text-right">{resumo}</p>
      </div>
    </div>
  )
}

export function Opcoes<T extends string | number>({
  rotulo,
  opcoes,
  valor,
  onChange,
  multiplo = false,
}: {
  rotulo: string
  opcoes: { id: T; nome: string }[]
  valor: T | T[]
  onChange: (v: T) => void
  multiplo?: boolean
}) {
  const marcado = (id: T) => (Array.isArray(valor) ? valor.includes(id) : valor === id)
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium text-muted-foreground">{rotulo}</legend>
      <div className="flex flex-wrap gap-1.5" role={multiplo ? 'group' : 'radiogroup'}>
        {opcoes.map((o) => (
          <button
            key={String(o.id)}
            type="button"
            role={multiplo ? 'checkbox' : 'radio'}
            aria-checked={marcado(o.id)}
            onClick={() => onChange(o.id)}
            className={cn(
              'h-10 min-w-12 rounded-[10px] border px-3.5 text-sm font-semibold transition-all',
              marcado(o.id)
                ? 'border-primary bg-primary/12 text-white'
                : 'border-border bg-[#101010] text-muted-foreground hover:border-[#3a3a3a] hover:text-foreground',
            )}
          >
            {o.nome}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
