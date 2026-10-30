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
    <aside className="sticky top-0 hidden h-dvh w-[280px] shrink-0 p-4 lg:block">
      <div className="flex h-full flex-col rounded-[24px] bg-surface px-4 py-6 shadow-[var(--shadow-soft)]">
      <div className="px-2">
        <Logo />
        <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground">Unidade {UNIDADE}</p>
      </div>

      <p className="mt-9 px-3.5 text-[11px] font-semibold tracking-[0.12em] text-subtle uppercase">Menu</p>

      <nav aria-label="Menu principal" className="mt-2 flex flex-col gap-1">
        {ITENS_NAV.map(({ para, nome, icone: Icone }) => (
          <NavLink
            key={para}
            to={para}
            end={para === '/'}
            className={({ isActive }) =>
              cn(
                'group relative flex h-12 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive ? 'text-white' : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-ativo"
                    className="absolute inset-0 rounded-full bg-primary shadow-[0_8px_20px_-10px_rgba(255,90,0,0.6)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icone className="relative size-5" strokeWidth={isActive ? 2.1 : 1.7} />
                <span className="relative flex-1">{nome}</span>
                {para === '/' && pendentes > 0 && (
                  <span
                    className={cn(
                      'relative grid h-6 min-w-6 place-items-center rounded-full px-1.5 font-display text-xs font-bold tabular',
                      isActive ? 'bg-white text-primary-ink' : 'bg-primary text-white',
                    )}
                  >
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
      </div>
    </aside>
  )
}
