import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Save, Send } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Campo } from '@/components/common/Campo'
import { BalaoWhatsApp } from './BalaoWhatsApp'
import { CabecalhoAssistente, Opcoes } from './CabecalhoAssistente'
import { useCrm } from '@/store/CrmProvider'
import { DIAS_SEMANA } from '@/lib/constantes'
import { dataCurta, diaSemanaEData } from '@/lib/datas'
import { preencherModelo } from '@/lib/mensagens'
import type { AssistenteLivia, ConfigLivia, DiaSemana } from '@/types'

const VARIAVEIS = [
  { v: '{nome}', nome: 'Nome' },
  { v: '{empresa}', nome: 'Empresa' },
  { v: '{cidade}', nome: 'Cidade' },
  { v: '{meu_nome}', nome: 'Meu nome' },
]

export function CardLivia({ livia }: { livia: AssistenteLivia }) {
  const { salvarAssistente, empresas, usuariaAtual } = useCrm()
  const [cfg, setCfg] = useState<ConfigLivia>(livia.config)
  const area = useRef<HTMLTextAreaElement>(null)
  useEffect(() => setCfg(livia.config), [livia.config])

  const alterado = JSON.stringify(cfg) !== JSON.stringify(livia.config)
  const exemplo = useMemo(
    () => empresas.find((e) => e.status === 'fila') ?? empresas[0],
    [empresas],
  )
  const semana = livia.historico.slice(0, 5)
  const enviadas = semana.reduce((s, h) => s + h.enviadas, 0)
  const respostas = semana.reduce((s, h) => s + h.respostas, 0)
  const fila = empresas.filter((e) => e.status === 'fila').length

  function inserir(variavel: string) {
    const el = area.current
    if (!el) return setCfg((c) => ({ ...c, modelo: c.modelo + variavel }))
    const ini = el.selectionStart
    const fim = el.selectionEnd
    const novo = cfg.modelo.slice(0, ini) + variavel + cfg.modelo.slice(fim)
    setCfg((c) => ({ ...c, modelo: novo }))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(ini + variavel.length, ini + variavel.length)
    })
  }

  function alternarDia(d: DiaSemana) {
    setCfg((c) => ({ ...c, dias: c.dias.includes(d) ? c.dias.filter((x) => x !== d) : [...c.dias, d] }))
  }

  async function salvar() {
    await salvarAssistente({ ...livia, config: cfg })
    toast.success('Ajustes da Lívia salvos', { description: `Ela manda ${cfg.quantidadePorDia} mensagens por dia às ${cfg.horario}.` })
  }

  async function ativar(v: boolean) {
    await salvarAssistente({ ...livia, ativo: v })
    toast.success(v ? 'Lívia ativada' : 'Lívia pausada', {
      description: v ? 'Os disparos voltam no próximo horário marcado.' : 'Nenhuma mensagem será enviada até você ativar de novo.',
    })
  }

  return (
    <article className="surface overflow-hidden">
      <CabecalhoAssistente
        inicial="L"
        nome="Lívia"
        funcao="Primeiro contato pelo WhatsApp"
        ativo={livia.ativo}
        onAtivo={ativar}
        resumo={
          <>
            Esta semana: <span className="font-semibold text-foreground">{enviadas} mensagens</span>,{' '}
            <span className="font-semibold text-primary">{respostas} respostas</span> · {fila} empresas na fila
          </>
        }
      />

      <div className="grid gap-8 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
            <Campo id="livia-hora" label="Horário do disparo">
              <Input id="livia-hora" type="time" value={cfg.horario} onChange={(e) => setCfg({ ...cfg, horario: e.target.value })} />
            </Campo>
            <Opcoes
              rotulo="Mensagens por dia"
              opcoes={[
                { id: 10, nome: '10' },
                { id: 20, nome: '20' },
                { id: 50, nome: '50' },
              ]}
              valor={cfg.quantidadePorDia}
              onChange={(v) => setCfg({ ...cfg, quantidadePorDia: v as ConfigLivia['quantidadePorDia'] })}
            />
          </div>
          <Opcoes
            rotulo="Dias da semana"
            multiplo
            opcoes={DIAS_SEMANA.map((d) => ({ id: d.id, nome: d.curto }))}
            valor={cfg.dias}
            onChange={alternarDia}
          />
          <div>
            <Campo id="livia-modelo" label="Modelo da mensagem">
              <Textarea
                ref={area}
                id="livia-modelo"
                rows={6}
                value={cfg.modelo}
                onChange={(e) => setCfg({ ...cfg, modelo: e.target.value })}
              />
            </Campo>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[13px] text-[#7a7a7a]">Inserir:</span>
              {VARIAVEIS.map((x) => (
                <button
                  key={x.v}
                  type="button"
                  onClick={() => inserir(x.v)}
                  className="rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1 font-mono text-[13px] text-[#FF8A4C] transition-colors hover:bg-primary/15"
                  aria-label={`Inserir ${x.nome}`}
                >
                  {x.v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={salvar} disabled={!alterado}>
              <Save /> Salvar ajustes
            </Button>
            {alterado && <span className="text-sm text-[#FACC15]">Você tem alterações não salvas</span>}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2.5 text-[13px] font-medium text-muted-foreground">
              Como {exemplo ? `${exemplo.decisor.nome.split(' ')[0]} vai receber` : 'a mensagem chega'}
            </p>
            {exemplo && (
              <BalaoWhatsApp
                contato={exemplo.decisor.nome}
                empresa={exemplo.nome}
                texto={preencherModelo(cfg.modelo, exemplo, usuariaAtual)}
                horario={cfg.horario}
              />
            )}
          </div>
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
              <Send className="size-3.5" /> Últimos disparos
            </p>
            <div className="h-24 rounded-[12px] border border-border bg-[#101010] px-2 pt-2" aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...livia.historico].reverse().map((h) => ({ dia: dataCurta(h.data), Enviadas: h.enviadas, Respostas: h.respostas }))}>
                  <XAxis dataKey="dia" tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#1C1C1C', border: '1px solid #2e2e2e', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: '#A3A3A3' }}
                  />
                  <Bar dataKey="Enviadas" fill="#3a3a3a" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Respostas" fill="#FF5A00" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 divide-y divide-border">
              {livia.historico.slice(0, 4).map((h) => (
                <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-[#d4d4d4]">{diaSemanaEData(h.data)}</span>
                  <span className="text-muted-foreground tabular">
                    {h.enviadas} enviadas · <span className="font-semibold text-primary">{h.respostas} respostas</span>
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
