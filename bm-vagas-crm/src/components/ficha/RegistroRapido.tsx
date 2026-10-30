import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, MessageSquarePlus, Send } from 'lucide-react'
import { addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SeletorTipo } from '@/components/common/SeletorTipo'
import { useCrm } from '@/store/CrmProvider'
import { diaISO, fraseProximoContato } from '@/lib/datas'
import { cn } from '@/lib/utils'
import type { Empresa, TipoInteracao } from '@/types'

const PRAZOS: { dias: number | null; nome: string }[] = [
  { dias: 1, nome: '1 dia' },
  { dias: 3, nome: '3 dias' },
  { dias: 7, nome: '7 dias' },
  { dias: 15, nome: '15 dias' },
  { dias: null, nome: 'Sem data' },
]

/** Campo fixo no rodapé da ficha para registrar uma conversa em segundos. */
export function RegistroRapido({ empresa }: { empresa: Empresa }) {
  const { registrarContato } = useCrm()
  const [tipo, setTipo] = useState<TipoInteracao>('whatsapp')
  const [texto, setTexto] = useState('')
  const [dias, setDias] = useState<number | null>(3)
  const [salvando, setSalvando] = useState(false)
  // No celular o painel começa fechado para sobrar espaço para a ficha.
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    setTexto('')
    setTipo('whatsapp')
    setDias(3)
    setAberto(false)
  }, [empresa.id])

  async function salvar() {
    if (!texto.trim()) {
      toast.error('Escreva o que foi conversado antes de salvar.')
      return
    }
    setSalvando(true)
    const dia = dias === null ? (tipo === 'anotacao' ? empresa.proximoContato : null) : diaISO(addDays(new Date(), dias))
    await registrarContato({ empresaId: empresa.id, tipo, texto, proximoContato: dia })
    setSalvando(false)
    setTexto('')
    setAberto(false)
    toast.success(tipo === 'anotacao' ? 'Anotação salva' : 'Contato registrado', {
      description: dia ? fraseProximoContato(dia) + '.' : 'Sem próximo contato marcado.',
    })
  }

  return (
    <div className="border-t border-border bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_40px_-20px_rgba(60,40,20,0.08)] sm:px-7">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex h-12 w-full items-center gap-2 rounded-[12px] border border-transparent bg-surface-2 px-4 text-[15px] font-semibold text-foreground sm:hidden"
      >
        <MessageSquarePlus className="size-5 text-primary" />
        Registrar conversa
        <ChevronDown className={cn('ml-auto size-4 text-muted-foreground transition-transform', aberto && 'rotate-180')} />
      </button>
      <div className={cn('mt-3 sm:mt-0 sm:block', aberto ? 'block' : 'hidden')}>
      <p className="mb-2.5 hidden text-[13px] font-semibold text-foreground sm:block">Registrar conversa</p>
      <SeletorTipo valor={tipo} onChange={setTipo} compacto />
      <div className="mt-2.5 flex gap-2">
        <label htmlFor="registro-texto" className="sr-only">
          O que foi conversado
        </label>
        <Textarea
          id="registro-texto"
          rows={2}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void salvar()
          }}
          placeholder="O que foi conversado?"
          className="min-h-[52px] flex-1"
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span id="prazo-rotulo" className="text-[13px] text-muted-foreground">
          Próximo contato em
        </span>
        <div role="radiogroup" aria-labelledby="prazo-rotulo" className="flex flex-wrap gap-1.5">
          {PRAZOS.map((p) => (
            <button
              key={p.nome}
              type="button"
              role="radio"
              aria-checked={dias === p.dias}
              onClick={() => setDias(p.dias)}
              className={cn(
                'h-9 rounded-full border px-3 text-[13px] font-semibold transition-colors',
                dias === p.dias
                  ? 'border-primary bg-primary/10 text-primary-ink'
                  : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {p.nome}
            </button>
          ))}
        </div>
        <Button onClick={salvar} disabled={salvando} className="ml-auto">
          <Send className="size-4" /> Salvar
        </Button>
      </div>
      </div>
    </div>
  )
}
