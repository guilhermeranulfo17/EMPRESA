import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

/** Estado vazio comemorativo da tela Hoje. */
export function TudoEmDia({ proximos }: { proximos: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="surface relative flex flex-col items-center overflow-hidden px-6 py-16 text-center"
    >
      <div className="relative mb-7 grid size-28 place-items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-success/40"
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.85, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          className="relative grid size-20 place-items-center rounded-full bg-success text-white shadow-[0_0_60px_-10px_rgba(34,197,94,0.7)]"
        >
          <Check className="size-10" strokeWidth={3} />
        </motion.div>
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground">Tudo em dia por hoje</h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Todos os contatos de hoje foram feitos. Excelente trabalho!
        {proximos > 0 && ` Amanhã tem ${proximos} ${proximos === 1 ? 'contato' : 'contatos'} esperando por vocês.`}
      </p>
      <Button variant="secondary" size="lg" className="mt-7" asChild>
        <Link to="/funil">Ver o funil</Link>
      </Button>
    </motion.section>
  )
}
