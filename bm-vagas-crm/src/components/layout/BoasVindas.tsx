import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AvatarUsuaria } from '@/components/common/AvatarUsuaria'
import { Logo } from '@/components/common/Logo'
import { api } from '@/services'
import { useCrm } from '@/store/CrmProvider'
import type { UsuariaId } from '@/types'

const PONTOS = [
  'Esta é uma versão de teste para vocês conhecerem e darem opinião.',
  'As empresas e pessoas são de exemplo. Podem clicar em tudo à vontade.',
  'Nenhuma mensagem é enviada de verdade, e nada do que vocês mexerem aparece para mais ninguém.',
]

/** Primeira abertura: explica a versão de teste e pergunta quem está usando. */
export function BoasVindas() {
  const { carregando, config, trocarUsuaria } = useCrm()
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!carregando && !api.sessao.preferencia('boas-vindas-vista', false)) setAberto(true)
  }, [carregando])

  function escolher(id: UsuariaId) {
    trocarUsuaria(id)
    api.sessao.salvarPreferencia('boas-vindas-vista', true)
    setAberto(false)
  }

  return (
    <Dialog open={aberto} onOpenChange={() => {}}>
      <DialogContent esconderFechar onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} className="sm:max-w-md">
        <Logo />
        <DialogHeader className="pr-0">
          <DialogTitle className="text-2xl">Bem-vindas ao BM Vagas CRM</DialogTitle>
          <DialogDescription>O sistema que organiza a prospecção da unidade Rocha &amp; Nascimento.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2.5">
          {PONTOS.map((p) => (
            <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-2">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-ink">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <div>
          <p className="mb-2.5 text-sm font-semibold text-foreground">Quem está usando agora?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {config.usuarias.map((u, i) => (
              <motion.button
                key={u.id}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                onClick={() => escolher(u.id)}
                className="flex flex-col items-center gap-2 rounded-[18px] bg-surface-2 px-3 py-5 transition-colors hover:bg-primary/[0.08] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <AvatarUsuaria id={u.id} tamanho="lg" comDica={false} />
                <span className="font-display text-lg font-bold">{u.nome}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
