import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, CalendarClock, MapPin, X } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DiasParado } from '@/components/common/DiasParado'
import { ReagendarPopover } from '@/components/hoje/ReagendarPopover'
import { BlocoDecisor } from './BlocoDecisor'
import { BlocoDados } from './BlocoDados'
import { BlocoServicos } from './BlocoServicos'
import { LinhaDoTempo } from './LinhaDoTempo'
import { RegistroRapido } from './RegistroRapido'
import { useCrm } from '@/store/CrmProvider'
import { useFicha } from '@/hooks/useFicha'
import { COR_ETAPA } from '@/lib/constantes'
import { diasAte, textoProximoContato } from '@/lib/datas'
import { formatarMoeda } from '@/lib/formatar'
import { interacoesPorEmpresa } from '@/lib/selecoes'
import type { EtapaId, UsuariaId } from '@/types'

const STATUS_BASE = { fila: 'Na fila de disparo', contatada: 'Já contatada', funil: 'No funil' } as const

export function FichaEmpresa() {
  const { empresaId, fechar } = useFicha()
  const { empresas, interacoes, config, atualizarEmpresa, moverEtapa } = useCrm()
  const empresa = useMemo(() => empresas.find((e) => e.id === empresaId) ?? null, [empresas, empresaId])
  const historico = useMemo(
    () => (empresa ? (interacoesPorEmpresa(interacoes).get(empresa.id) ?? []) : []),
    [interacoes, empresa],
  )
  const [valor, setValor] = useState('')

  useEffect(() => {
    if (empresa) setValor(empresa.valorEstimado ? String(empresa.valorEstimado) : '')
  }, [empresa?.id, empresa?.valorEstimado]) // eslint-disable-line react-hooks/exhaustive-deps

  async function salvarValor() {
    if (!empresa) return
    const n = Number(valor.replace(/\D/g, '')) || 0
    if (n === empresa.valorEstimado) return
    await atualizarEmpresa(empresa.id, { valorEstimado: n })
    toast.success('Valor estimado atualizado', { description: formatarMoeda(n) })
  }

  async function trocarEtapa(id: EtapaId) {
    if (!empresa) return
    await moverEtapa(empresa.id, id)
    const nome = config.etapas.find((e) => e.id === id)?.nome
    toast.success(id === 'fechado' ? 'Negócio fechado! Parabéns!' : `Empresa movida para ${nome}`, {
      description: empresa.nome,
    })
  }

  async function trocarResponsavel(id: UsuariaId) {
    if (!empresa) return
    await atualizarEmpresa(empresa.id, { responsavelId: id })
    toast.success(`Agora quem cuida é a ${config.usuarias.find((u) => u.id === id)?.nome}`)
  }

  const atrasado = empresa?.proximoContato ? diasAte(empresa.proximoContato) < 0 : false

  return (
    <Sheet open={!!empresa} onOpenChange={(v) => !v && fechar()}>
      <SheetContent aria-describedby={undefined}>
        {empresa && (
          <>
            {/* Cabeçalho */}
            <div className="border-b border-border bg-surface px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5 sm:px-7 sm:pt-6">
              <div className="flex items-start gap-3">
                <Button variant="ghost" size="icon-sm" onClick={fechar} aria-label="Voltar" className="-ml-2 sm:hidden">
                  <ArrowLeft />
                </Button>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="font-display text-[24px] leading-tight font-bold text-foreground sm:text-[26px]">
                    {empresa.nome}
                  </SheetTitle>
                  <SheetDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden />
                      {empresa.cidade}/{empresa.uf}
                    </span>
                    <span>{empresa.segmento}</span>
                    {empresa.status !== 'funil' && <Badge variant="info">{STATUS_BASE[empresa.status]}</Badge>}
                  </SheetDescription>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={fechar} aria-label="Fechar ficha" className="hidden sm:inline-flex">
                  <X />
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-[1.3fr_1fr_1fr]">
                <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                  <label htmlFor="ficha-etapa" className="text-xs font-medium text-muted-foreground">
                    Etapa
                  </label>
                  <Select value={empresa.etapaId ?? ''} onValueChange={(v) => trocarEtapa(v as EtapaId)}>
                    <SelectTrigger id="ficha-etapa">
                      <SelectValue placeholder="Colocar no funil" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.etapas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          <span className="inline-flex items-center gap-2">
                            <span className="size-2 rounded-full" style={{ backgroundColor: COR_ETAPA[e.id] }} />
                            {e.nome}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ficha-resp" className="text-xs font-medium text-muted-foreground">
                    Responsável
                  </label>
                  <Select value={empresa.responsavelId} onValueChange={(v) => trocarResponsavel(v as UsuariaId)}>
                    <SelectTrigger id="ficha-resp">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.usuarias.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ficha-valor" className="text-xs font-medium text-muted-foreground">
                    Valor estimado
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                    <Input
                      id="ficha-valor"
                      inputMode="numeric"
                      value={valor}
                      onChange={(e) => setValor(e.target.value.replace(/[^\d]/g, ''))}
                      onBlur={salvarValor}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="pl-10 font-display font-semibold text-primary tabular"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-transparent bg-surface-2 p-4">
                  <span
                    className={`grid size-10 place-items-center rounded-full ${atrasado ? 'bg-danger/15 text-danger-ink' : 'bg-primary/12 text-primary'}`}
                  >
                    <CalendarClock className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Próximo contato</p>
                    <p className={`font-semibold ${atrasado ? 'text-danger-ink' : 'text-foreground'}`}>
                      {empresa.proximoContato ? textoProximoContato(empresa.proximoContato) : 'Sem data marcada'}
                    </p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{empresa.proximaAcao}</p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                    <DiasParado desde={empresa.etapaDesde} />
                    <ReagendarPopover empresa={empresa}>
                      <Button variant="secondary" size="sm">
                        Reagendar
                      </Button>
                    </ReagendarPopover>
                  </div>
                </div>

                <BlocoDecisor empresa={empresa} />
                <BlocoServicos empresa={empresa} />
                <BlocoDados empresa={empresa} />
                <LinhaDoTempo interacoes={historico} />
              </div>
            </div>

            <RegistroRapido empresa={empresa} />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
