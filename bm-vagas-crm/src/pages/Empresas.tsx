import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Building2, ChevronRight, KanbanSquare, Search, Send, Upload, X } from 'lucide-react'
import { Pagina } from '@/components/common/Pagina'
import { CabecalhoPagina } from '@/components/common/CabecalhoPagina'
import { EsqueletoTabela } from '@/components/common/Esqueletos'
import { EstadoVazio } from '@/components/common/EstadoVazio'
import { AvatarUsuaria } from '@/components/common/AvatarUsuaria'
import { ImportarPlanilhaDialog } from '@/components/empresas/ImportarPlanilhaDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCrm } from '@/store/CrmProvider'
import { useFicha } from '@/hooks/useFicha'
import { NOME_UF, SEGMENTOS, UFS } from '@/lib/constantes'
import { formatarTelefone } from '@/lib/formatar'
import { normalizar, cn } from '@/lib/utils'
import type { Empresa, Segmento, StatusBase, UF } from '@/types'

const STATUS: Record<StatusBase, { nome: string; variante: 'info' | 'warning' | 'brand' }> = {
  fila: { nome: 'Na fila de disparo', variante: 'info' },
  contatada: { nome: 'Já contatada', variante: 'warning' },
  funil: { nome: 'No funil', variante: 'brand' },
}

export default function Empresas() {
  const { carregando, empresas, mudarStatus } = useCrm()
  const { abrir } = useFicha()
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [uf, setUf] = useState<'todos' | UF>('todos')
  const [segmento, setSegmento] = useState<'todos' | Segmento>('todos')
  const [status, setStatus] = useState<'todos' | StatusBase>('todos')
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [importar, setImportar] = useState(false)
  const origemRafael = params.get('origem') === 'rafael'

  useEffect(() => setSelecionadas(new Set()), [busca, uf, segmento, status, origemRafael])

  const lista = useMemo(() => {
    const termo = normalizar(busca)
    return empresas
      .filter((e) => {
        if (origemRafael && e.origem !== 'rafael') return false
        if (termo && !normalizar(`${e.nome} ${e.decisor.nome} ${e.cidade}`).includes(termo)) return false
        if (uf !== 'todos' && e.uf !== uf) return false
        if (segmento !== 'todos' && e.segmento !== segmento) return false
        if (status !== 'todos' && e.status !== status) return false
        return true
      })
      .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
  }, [empresas, busca, uf, segmento, status, origemRafael])

  const contagem = useMemo(() => {
    const c = { fila: 0, contatada: 0, funil: 0 }
    for (const e of empresas) c[e.status]++
    return c
  }, [empresas])

  const todasMarcadas = lista.length > 0 && lista.every((e) => selecionadas.has(e.id))
  const algumaMarcada = selecionadas.size > 0

  function alternar(id: string) {
    setSelecionadas((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function alternarTodas() {
    setSelecionadas(todasMarcadas ? new Set() : new Set(lista.map((e) => e.id)))
  }

  async function enviar(destino: StatusBase) {
    const ids = [...selecionadas]
    await mudarStatus(ids, destino)
    setSelecionadas(new Set())
    const n = ids.length
    toast.success(
      destino === 'funil'
        ? `${n} ${n === 1 ? 'empresa enviada' : 'empresas enviadas'} ao funil`
        : `${n} ${n === 1 ? 'empresa colocada' : 'empresas colocadas'} na fila de disparo`,
      { description: destino === 'funil' ? 'Elas aparecem em "Nova empresa" e na lista de hoje.' : 'A Lívia manda a primeira mensagem.' },
    )
  }

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Empresas"
        subtitulo={
          carregando
            ? 'Carregando…'
            : `${empresas.length} na base · ${contagem.fila} na fila · ${contagem.contatada} já contatadas · ${contagem.funil} no funil`
        }
        acoes={
          <Button size="lg" onClick={() => setImportar(true)}>
            <Upload /> Importar planilha
          </Button>
        }
      />

      {origemRafael && (
        <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-primary/30 bg-primary/[0.06] px-4 py-3 text-sm">
          <span className="flex-1 text-[#d4d4d4]">Mostrando só as empresas encontradas pelo Rafael.</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setParams((p) => {
                const n = new URLSearchParams(p)
                n.delete('origem')
                return n
              })
            }
          >
            <X className="size-4" /> Ver todas
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#6b6b6b]" aria-hidden />
          <label htmlFor="busca-empresas" className="sr-only">
            Buscar empresa
          </label>
          <Input id="busca-empresas" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por empresa, pessoa ou cidade" className="pl-10" />
        </div>
        <div className="grid grid-cols-2 gap-2 lg:flex">
          <Select value={uf} onValueChange={(v) => setUf(v as typeof uf)}>
            <SelectTrigger aria-label="Filtrar por estado" className="lg:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {UFS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u} · {NOME_UF[u]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={segmento} onValueChange={(v) => setSegmento(v as typeof segmento)}>
            <SelectTrigger aria-label="Filtrar por segmento" className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os segmentos</SelectItem>
              {SEGMENTOS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger aria-label="Filtrar por situação" className="col-span-2 lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as situações</SelectItem>
              {(Object.keys(STATUS) as StatusBase[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS[s].nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5">
        {carregando ? (
          <EsqueletoTabela />
        ) : lista.length === 0 ? (
          <EstadoVazio
            icone={Building2}
            titulo="Nenhuma empresa por aqui"
            texto="Mude os filtros ou importe uma planilha para começar."
            acao={
              <Button variant="secondary" onClick={() => setImportar(true)}>
                <Upload /> Importar planilha
              </Button>
            }
          />
        ) : (
          <div className="surface overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
              <Checkbox
                id="marcar-todas"
                checked={todasMarcadas ? true : algumaMarcada ? 'indeterminate' : false}
                onCheckedChange={alternarTodas}
                aria-label="Selecionar todas"
              />
              <label htmlFor="marcar-todas" className="cursor-pointer text-[13px] font-semibold text-muted-foreground sm:sr-only">
                {algumaMarcada ? `${selecionadas.size} selecionadas` : `Selecionar todas (${lista.length})`}
              </label>
              <div
                aria-hidden
                className="hidden flex-1 grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_150px] gap-x-4 text-[12px] font-semibold tracking-wider text-[#7a7a7a] uppercase sm:grid"
              >
                <span>Empresa {algumaMarcada && <span className="text-primary normal-case">· {selecionadas.size} selecionadas</span>}</span>
                <span>Local e segmento</span>
                <span>Telefone</span>
                <span>Situação</span>
              </div>
              <span className="hidden w-[52px] sm:block" />
            </div>
            <ul>
              {lista.map((e) => (
                <LinhaEmpresa key={e.id} empresa={e} marcada={selecionadas.has(e.id)} onMarcar={() => alternar(e.id)} onAbrir={() => abrir(e.id)} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Barra de ações em massa */}
      <AnimatePresence>
        {algumaMarcada && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className="fixed inset-x-3 bottom-[84px] z-30 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-[16px] border border-[#333] bg-[#1a1a1a]/95 p-2.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)] backdrop-blur lg:bottom-6 lg:left-[264px]"
            role="region"
            aria-label="Ações para as empresas selecionadas"
          >
            <span className="px-2 font-display text-sm font-bold">
              <span className="text-primary">{selecionadas.size}</span> selecionadas
            </span>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => enviar('fila')}>
                <Send /> Fila de disparo
              </Button>
              <Button onClick={() => enviar('funil')}>
                <KanbanSquare /> Enviar ao funil
              </Button>
              <Button variant="ghost" size="icon" aria-label="Limpar seleção" onClick={() => setSelecionadas(new Set())}>
                <X />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportarPlanilhaDialog aberto={importar} onOpenChange={setImportar} />
    </Pagina>
  )
}

function LinhaEmpresa({
  empresa: e,
  marcada,
  onMarcar,
  onAbrir,
}: {
  empresa: Empresa
  marcada: boolean
  onMarcar: () => void
  onAbrir: () => void
}) {
  const st = STATUS[e.status]
  return (
    <li
      className={cn(
        'group flex items-center gap-3 border-b border-border px-4 transition-colors last:border-0 sm:px-5',
        marcada ? 'bg-primary/[0.05]' : 'hover:bg-surface-2',
      )}
    >
      <Checkbox checked={marcada} onCheckedChange={onMarcar} aria-label={`Selecionar ${e.nome}`} />
      <button type="button" onClick={onAbrir} className="grid min-w-0 flex-1 items-center gap-x-4 gap-y-1 py-3.5 text-left sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_150px]">
        <span className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{e.nome}</span>
          <span className="block truncate text-[13px] text-muted-foreground">
            {e.decisor.nome}
            {e.decisor.cargo && ` · ${e.decisor.cargo}`}
          </span>
        </span>
        <span className="hidden min-w-0 text-sm sm:block">
          <span className="block truncate text-[#d4d4d4]">
            {e.cidade}/{e.uf}
          </span>
          <span className="block truncate text-[13px] text-[#7a7a7a]">{e.segmento}</span>
        </span>
        <span className="hidden truncate text-sm text-muted-foreground tabular sm:block">
          {e.decisor.telefone ? formatarTelefone(e.decisor.telefone) : '—'}
        </span>
        <span className="flex items-center gap-2">
          <Badge variant={st.variante}>{st.nome}</Badge>
          <span className="text-[13px] text-[#7a7a7a] sm:hidden">
            {e.cidade}/{e.uf}
          </span>
        </span>
      </button>
      <AvatarUsuaria id={e.responsavelId} tamanho="sm" />
      <ChevronRight className="hidden size-4 text-[#555] transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
    </li>
  )
}
