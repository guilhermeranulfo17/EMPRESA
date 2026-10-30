import { NavLink } from 'react-router'
import { motion } from 'framer-motion'
import { Logo } from '@/components/common/Logo'
import { UNIDADE } from '@/config/brand'
import { useCrm } from '@/store/CrmProvider'
import { contatosDoDia } from '@/lib/selecoes'
import { cn } from '@/lib/utils'
import { ITENS_NAV } from './navegacao'
import { TrocarUsuaria } from './TrocarUsuaria'

export function BarraLateral() {
  const { empresas, carregando } = useCrm()
  const pendentes = carregando ? 0 : contatosDoDia(empresas).length

  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-border bg-[#0d0d0d]/90 px-4 py-6 backdrop-blur lg:flex">
      <div className="px-2">
        <Logo />
        <p className="mt-3 text-xs font-medium tracking-wide text-[#7a7a7a]">Unidade {UNIDADE}</p>
      </div>

      <nav aria-label="Menu principal" className="mt-9 flex flex-col gap-1">
        {ITENS_NAV.map(({ para, nome, icone: Icone }) => (
          <NavLink
            key={para}
            to={para}
            end={para === '/'}
            className={({ isActive }) =>
              cn(
                'group relative flex h-12 items-center gap-3 rounded-[12px] px-3.5 text-[15px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-ativo"
                    className="absolute inset-0 rounded-[12px] border border-[#2a2a2a] bg-surface-2"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId="nav-barra"
                    className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icone className={cn('relative size-5', isActive && 'text-primary')} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="relative flex-1">{nome}</span>
                {para === '/' && pendentes > 0 && (
                  <span className="relative grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 font-display text-xs font-bold text-white tabular">
                    {pendentes}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <TrocarUsuaria />
      </div>
    </aside>
  )
}
