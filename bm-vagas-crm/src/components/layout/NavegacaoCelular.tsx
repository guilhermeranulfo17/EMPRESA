import { NavLink } from 'react-router'
import { motion } from 'framer-motion'
import { Logo } from '@/components/common/Logo'
import { useCrm } from '@/store/CrmProvider'
import { contatosDoDia } from '@/lib/selecoes'
import { cn } from '@/lib/utils'
import { ITENS_NAV } from './navegacao'
import { TrocarUsuaria } from './TrocarUsuaria'

export function TopoCelular() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-[#0a0a0a]/85 px-4 backdrop-blur-md lg:hidden">
      <Logo />
      <TrocarUsuaria compacto />
    </header>
  )
}

export function NavegacaoCelular() {
  const { empresas, carregando } = useCrm()
  const pendentes = carregando ? 0 : contatosDoDia(empresas).length
  return (
    <nav
      aria-label="Menu principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-[#0d0d0d]/95 backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITENS_NAV.map(({ para, curto, icone: Icone }) => (
          <li key={para}>
            <NavLink
              to={para}
              end={para === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex h-[66px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors outline-none focus-visible:bg-surface-2',
                  isActive ? 'text-foreground' : 'text-[#8a8a8a]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-celular"
                      className="absolute top-0 h-[3px] w-10 rounded-b-full bg-primary"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative">
                    <Icone className={cn('size-6', isActive && 'text-primary')} strokeWidth={isActive ? 2.2 : 1.8} />
                    {para === '/' && pendentes > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                        {pendentes}
                      </span>
                    )}
                  </span>
                  {curto}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
