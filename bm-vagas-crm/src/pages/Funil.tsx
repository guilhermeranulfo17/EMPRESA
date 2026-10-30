import { useMemo, useState } from 'react'
import { KanbanSquare, List, Plus, SearchX } from 'lucide-react'
import { Pagina } from '@/components/common/Pagina'
import { CabecalhoPagina } from '@/components/common/CabecalhoPagina'
import { EsqueletoFunil } from '@/components/common/Esqueletos'
import { EstadoVazio } from '@/components/common/EstadoVazio'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BarraFiltros } from '@/components/funil/BarraFiltros'
import { Kanban } from '@/components/funil/Kanban'
import { ListaFunil } from '@/components/funil/ListaFunil'
import { FILTROS_VAZIOS, aplicarFiltros, type Filtros } from '@/components/funil/filtros'
import { useCrm } from '@/store/CrmProvider'
import { useUi } from '@/store/UiProvider'
import { formatarMoeda } from '@/lib/formatar'
import { api } from '@/services'

type Visao = 'kanban' | 'lista'


export default function Funil() {
  const { carregando, empresas } = useCrm()
  const { abrirNovaEmpresa } = useUi()
  const [visao, setVisao] = useState<Visao>(() => api.sessao.preferencia<Visao>('visao-funil', 'kanban'))
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS)

  const doFunil = useMemo(() => empresas.filter((e) => e.status === 'funil' && e.etapaId), [empresas])
  const filtradas = useMemo(() => aplicarFiltros(doFunil, filtros), [doFunil, filtros])
  const emAberto = filtradas
    .filter((e) => e.etapaId !== 'fechado' && e.etapaId !== 'perdido')
    .reduce((s, e) => s + e.valorEstimado, 0)

  function trocarVisao(v: string) {
    if (!v) return
    setVisao(v as Visao)
    api.sessao.salvarPreferencia('visao-funil', v)
  }

  return (
    <Pagina larga>
      <CabecalhoPagina
        titulo="Funil"
        subtitulo={
          carregando ? 'Carregando…' : (
            <>
              {filtradas.length} empresas · <span className="font-semibold text-foreground">{formatarMoeda(emAberto)}</span> em aberto
            </>
          )
        }
        acoes={
          <>
            <ToggleGroup type="single" value={visao} onValueChange={trocarVisao} aria-label="Modo de ver o funil">
              <ToggleGroupItem value="kanban" aria-label="Ver em colunas">
                <KanbanSquare /> Colunas
              </ToggleGroupItem>
              <ToggleGroupItem value="lista" aria-label="Ver em lista">
                <List /> Lista
              </ToggleGroupItem>
            </ToggleGroup>
            <Button size="lg" onClick={() => abrirNovaEmpresa()} className="hidden sm:inline-flex">
              <Plus /> Nova empresa
            </Button>
          </>
        }
      />

      <div className="mt-6">
        <BarraFiltros filtros={filtros} onChange={setFiltros} />
      </div>

      <div className="mt-6">
        {carregando ? (
          <EsqueletoFunil />
        ) : filtradas.length === 0 ? (
          <EstadoVazio
            icone={SearchX}
            titulo="Nenhuma empresa com esses filtros"
            texto="Tente outra busca ou limpe os filtros para ver o funil inteiro."
            acao={
              <Button variant="secondary" onClick={() => setFiltros(FILTROS_VAZIOS)}>
                Limpar filtros
              </Button>
            }
          />
        ) : visao === 'kanban' ? (
          <Kanban empresas={filtradas} />
        ) : (
          <ListaFunil empresas={filtradas} />
        )}
      </div>

      {/* Botão sempre visível no celular */}
      <Button
        size="icon"
        onClick={() => abrirNovaEmpresa()}
        aria-label="Nova empresa"
        className="fixed right-4 bottom-[88px] z-20 size-14 rounded-full shadow-[0_12px_30px_-6px_rgba(255,90,0,0.28)] sm:hidden"
      >
        <Plus className="size-6" />
      </Button>
    </Pagina>
  )
}
