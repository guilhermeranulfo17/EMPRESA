import { useEffect, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { ArrowRight, Radar, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CabecalhoAssistente, Opcoes } from './CabecalhoAssistente'
import { useCrm } from '@/store/CrmProvider'
import { DIAS_SEMANA, SEGMENTOS, UFS } from '@/lib/constantes'
import { diaSemanaEData } from '@/lib/datas'
import type { AssistenteRafael, ConfigRafael, Segmento, UF } from '@/types'

export function CardRafael({ rafael }: { rafael: AssistenteRafael }) {
  const { salvarAssistente } = useCrm()
  const [cfg, setCfg] = useState<ConfigRafael>(rafael.config)
  const [cidade, setCidade] = useState('')
  useEffect(() => setCfg(rafael.config), [rafael.config])

  const alterado = JSON.stringify(cfg) !== JSON.stringify(rafael.config)
  const ultima = rafael.historico[0]
  const dia = DIAS_SEMANA.find((d) => d.id === cfg.diaSemana)?.nome.toLowerCase() ?? 'segunda'

  const alternar = <T,>(lista: T[], item: T) => (lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item])

  function addCidade(e?: KeyboardEvent) {
    if (e && e.key !== 'Enter' && e.key !== ',') return
    e?.preventDefault()
    const c = cidade.trim()
    if (!c || cfg.cidades.includes(c)) return setCidade('')
    setCfg({ ...cfg, cidades: [...cfg.cidades, c] })
    setCidade('')
  }

  async function salvar() {
    await salvarAssistente({ ...rafael, config: cfg })
    toast.success('Ajustes do Rafael salvos', {
      description: `Na próxima ${dia} ele busca até ${cfg.quantidadePorSemana} empresas.`,
    })
  }

  async function ativar(v: boolean) {
    await salvarAssistente({ ...rafael, ativo: v })
    toast.success(v ? 'Rafael ativado' : 'Rafael pausado', {
      description: v ? `Ele volta a buscar empresas toda ${dia}.` : 'Nenhuma busca nova até você ativar de novo.',
    })
  }

  return (
    <article className="surface overflow-hidden">
      <CabecalhoAssistente
        inicial="R"
        nome="Rafael"
        funcao={`Busca de empresas · toda ${dia}-feira`}
        ativo={rafael.ativo}
        onAtivo={ativar}
        resumo={
          <>
            Já encontrou <span className="font-semibold text-foreground">{rafael.historico.reduce((s, h) => s + h.encontradas, 0)} empresas</span> nas
            últimas {rafael.historico.length} semanas
          </>
        }
      />

      <div className="grid gap-8 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <Opcoes
            rotulo="Estados"
            multiplo
            opcoes={UFS.map((u) => ({ id: u, nome: u }))}
            valor={cfg.estados}
            onChange={(u) => setCfg({ ...cfg, estados: alternar<UF>(cfg.estados, u as UF) })}
          />
          <div>
            <label htmlFor="rafael-cidade" className="mb-2 block text-[13px] font-medium text-muted-foreground">
              Cidades específicas (opcional)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border border-input bg-[#101010] p-1.5 focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/25">
              {cfg.cidades.map((c) => (
                <span key={c} className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-surface-3 pr-1 pl-2.5 text-sm">
                  {c}
                  <button
                    type="button"
                    onClick={() => setCfg({ ...cfg, cidades: cfg.cidades.filter((x) => x !== c) })}
                    className="grid size-6 place-items-center rounded-[6px] text-muted-foreground hover:bg-[#333] hover:text-foreground"
                    aria-label={`Remover ${c}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
              <Input
                id="rafael-cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                onKeyDown={addCidade}
                onBlur={() => addCidade()}
                placeholder={cfg.cidades.length ? 'Mais uma…' : 'Digite e aperte Enter (ex.: Uberlândia)'}
                className="h-8 min-w-[180px] flex-1 border-0 bg-transparent px-2 focus-visible:ring-0"
              />
            </div>
          </div>
          <Opcoes
            rotulo="Segmentos"
            multiplo
            opcoes={SEGMENTOS.map((s) => ({ id: s, nome: s }))}
            valor={cfg.segmentos}
            onChange={(s) => setCfg({ ...cfg, segmentos: alternar<Segmento>(cfg.segmentos, s as Segmento) })}
          />
          <Opcoes
            rotulo="Empresas por semana"
            opcoes={[
              { id: 25, nome: '25' },
              { id: 50, nome: '50' },
              { id: 100, nome: '100' },
            ]}
            valor={cfg.quantidadePorSemana}
            onChange={(v) => setCfg({ ...cfg, quantidadePorSemana: v as ConfigRafael['quantidadePorSemana'] })}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={salvar} disabled={!alterado}>
              <Save /> Salvar ajustes
            </Button>
            {alterado && <span className="text-sm text-[#FACC15]">Você tem alterações não salvas</span>}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {ultima && (
            <div className="rounded-[16px] border border-primary/25 bg-[radial-gradient(120%_100%_at_100%_0%,rgba(255,90,0,0.10),transparent_60%)] p-5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                <Radar className="size-4 text-primary" /> Última busca
              </div>
              <p className="mt-3 font-display text-lg font-bold text-foreground">{diaSemanaEData(ultima.data)}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold text-primary tabular">{ultima.encontradas}</span>
                <span className="text-[15px] text-muted-foreground">empresas novas</span>
              </p>
              <Button variant="secondary" className="mt-4 w-full" asChild>
                <Link to="/empresas?origem=rafael">
                  Ver empresas encontradas <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
          <div>
            <p className="mb-1 text-[13px] font-medium text-muted-foreground">Buscas anteriores</p>
            <ul className="divide-y divide-border">
              {rafael.historico.slice(1).map((h) => (
                <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-[#d4d4d4]">{diaSemanaEData(h.data)}</span>
                  <span className="text-muted-foreground tabular">
                    <span className="font-semibold text-foreground">{h.encontradas}</span> empresas · {h.estados.join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  )
}
