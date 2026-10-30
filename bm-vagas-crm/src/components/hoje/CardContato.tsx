import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowRight, CalendarClock, Check, ChevronDown, Copy, MapPin, MessageSquareQuote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WhatsAppIcon } from '@/components/common/IconesMarca'
import { AvatarUsuaria } from '@/components/common/AvatarUsuaria'
import { ServicoTag } from '@/components/common/ServicoTag'
import { ReagendarPopover } from './ReagendarPopover'
import { useCrm } from '@/store/CrmProvider'
import { useFicha } from '@/hooks/useFicha'
import { NOME_TIPO_INTERACAO } from '@/lib/constantes'
import { diasAte, tempoRelativo } from '@/lib/datas'
import { copiarTexto, linkWhatsApp, preencherModelo } from '@/lib/mensagens'
import { modeloDaEtapa, nomeEtapa } from '@/lib/selecoes'
import { cn } from '@/lib/utils'
import type { Empresa, Interacao } from '@/types'

interface Props {
  empresa: Empresa
  ultimo?: Interacao
  onFeito: (e: Empresa) => void
}

export const CardContato = forwardRef<HTMLElement, Props>(function CardContato({ empresa, ultimo, onFeito }, ref) {
  const { config, usuariaAtual } = useCrm()
  const { abrir } = useFicha()
  const [verMensagem, setVerMensagem] = useState(false)

  const atraso = empresa.proximoContato ? -diasAte(empresa.proximoContato) : 0
  const atrasado = atraso > 0
  const mensagem = preencherModelo(modeloDaEtapa(config, empresa.etapaId).texto, empresa, usuariaAtual)

  async function copiar() {
    const ok = await copiarTexto(mensagem)
    if (ok) toast.success('Mensagem copiada', { description: 'É só colar no WhatsApp ou no e-mail.' })
    else toast.error('Não consegui copiar. Selecione o texto e copie manualmente.')
  }

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.97, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className={cn(
        'surface group relative overflow-hidden transition-[border-color,box-shadow] duration-200 hover:shadow-[var(--shadow-lift)]',
      )}
      aria-label={`${empresa.nome}${atrasado ? ', atrasado' : ''}`}
    >

      <div className="p-5 sm:p-6">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {atrasado ? (
                <Badge variant="danger">
                  <CalendarClock />
                  {atraso === 1 ? 'Atrasado desde ontem' : `Atrasado há ${atraso} dias`}
                </Badge>
              ) : (
                <Badge variant="brand">
                  <CalendarClock />
                  Para hoje
                </Badge>
              )}
              <span className="text-xs font-medium text-muted-foreground">{nomeEtapa(config, empresa.etapaId)}</span>
            </div>
            <button
              type="button"
              onClick={() => abrir(empresa.id)}
              className="group/nome flex max-w-full items-center gap-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <h3 className="truncate font-display text-xl font-bold text-foreground transition-colors group-hover/nome:text-primary-hover">
                {empresa.nome}
              </h3>
              <ArrowRight className="size-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all group-hover/nome:translate-x-0 group-hover/nome:opacity-100" />
            </button>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              {empresa.cidade}/{empresa.uf}
            </p>
          </div>
          <AvatarUsuaria id={empresa.responsavelId} />
        </div>

        {/* Pessoa + histórico */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[14px] bg-surface-2 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Falar com</p>
            <p className="mt-0.5 font-semibold text-foreground">{empresa.decisor.nome}</p>
            <p className="text-sm text-muted-foreground">{empresa.decisor.cargo}</p>
          </div>
          <div className="rounded-[14px] bg-surface-2 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Último contato</p>
            <p className="mt-0.5 font-semibold text-foreground">
              {ultimo ? `${tempoRelativo(ultimo.data)[0].toUpperCase()}${tempoRelativo(ultimo.data).slice(1)}, ${NOME_TIPO_INTERACAO[ultimo.tipo]}` : 'Ainda não houve'}
            </p>
            <p className="line-clamp-1 text-sm text-muted-foreground">{ultimo?.texto ?? 'Primeira conversa com esta empresa'}</p>
          </div>
        </div>

        {/* Próxima ação */}
        <div className="mt-4 flex items-start gap-3">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-foreground">{empresa.proximaAcao}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {empresa.servicos.slice(0, 2).map((s) => (
                <ServicoTag key={s} id={s} />
              ))}
            </div>
          </div>
        </div>

        {/* Mensagem sugerida */}
        <div className="mt-4 rounded-[14px] bg-surface-2">
          <button
            type="button"
            onClick={() => setVerMensagem((v) => !v)}
            aria-expanded={verMensagem}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageSquareQuote className="size-4 text-primary" />
            Mensagem sugerida
            <ChevronDown className={cn('ml-auto size-4 transition-transform', verMensagem && 'rotate-180')} />
          </button>
          <motion.div
            initial={false}
            animate={{ height: verMensagem ? 'auto' : 0, opacity: verMensagem ? 1 : 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-[15px] leading-relaxed text-ink-2">{mensagem}</p>
          </motion.div>
        </div>
      </div>

      {/* Ações */}
      <div className="grid grid-cols-2 gap-2 px-3 pb-4 sm:flex sm:flex-wrap sm:items-center sm:px-6 sm:pb-6">
        <Button variant="secondary" onClick={copiar} className="sm:flex-none">
          <Copy />
          Copiar mensagem
        </Button>
        <Button variant="whatsapp" asChild className="sm:flex-none">
          <a href={linkWhatsApp(empresa.decisor.telefone, mensagem)} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            Abrir no WhatsApp
          </a>
        </Button>
        <ReagendarPopover empresa={empresa}>
          <Button variant="ghost" className="sm:ml-auto">
            <CalendarClock />
            Reagendar
          </Button>
        </ReagendarPopover>
        <Button onClick={() => onFeito(empresa)}>
          <Check strokeWidth={2.6} />
          Feito
        </Button>
      </div>
    </motion.article>
  )
})
