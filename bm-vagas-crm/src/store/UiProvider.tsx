import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { EtapaId } from '@/types'

interface Ui {
  novaEmpresa: { aberta: boolean; etapa: EtapaId }
  abrirNovaEmpresa(etapa?: EtapaId): void
  fecharNovaEmpresa(): void
}

const UiContext = createContext<Ui | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [novaEmpresa, setNovaEmpresa] = useState<Ui['novaEmpresa']>({ aberta: false, etapa: 'nova' })
  const valor = useMemo<Ui>(
    () => ({
      novaEmpresa,
      abrirNovaEmpresa: (etapa = 'nova') => setNovaEmpresa({ aberta: true, etapa }),
      fecharNovaEmpresa: () => setNovaEmpresa((s) => ({ ...s, aberta: false })),
    }),
    [novaEmpresa],
  )
  return <UiContext.Provider value={valor}>{children}</UiContext.Provider>
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi precisa estar dentro de <UiProvider>')
  return ctx
}
