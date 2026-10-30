import { AnimatePresence } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router'
import { BarraLateral } from './BarraLateral'
import { NavegacaoCelular, TopoCelular } from './NavegacaoCelular'
import { FichaEmpresa } from '@/components/ficha/FichaEmpresa'
import { NovaEmpresaDialog } from '@/components/funil/NovaEmpresaDialog'

export function AppLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <div className="flex min-h-dvh">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <BarraLateral />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopoCelular />
        <AnimatePresence mode="wait" initial={false}>
          <div key={location.pathname} className="min-w-0 flex-1">
            {outlet}
          </div>
        </AnimatePresence>
      </div>
      <NavegacaoCelular />
      <FichaEmpresa />
      <NovaEmpresaDialog />
    </div>
  )
}
