import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Envolve cada tela com a transição de entrada e o respiro padrão. */
export function Pagina({ children, className, larga = false }: { children: ReactNode; className?: string; larga?: boolean }) {
  return (
    <motion.main
      id="conteudo"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'mx-auto w-full px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14',
        larga ? 'max-w-[1600px]' : 'max-w-[1180px]',
        className,
      )}
    >
      {children}
    </motion.main>
  )
}
