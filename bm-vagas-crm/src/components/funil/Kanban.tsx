import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { CardFunil } from './CardFunil'
import { useCrm } from '@/store/CrmProvider'
import { useUi } from '@/store/UiProvider'
import { useFicha } from '@/hooks/useFicha'
import { COR_ETAPA } from '@/lib/constantes'
import { formatarMoedaCurta } from '@/lib/formatar'
import { cn } from '@/lib/utils'
import type { Empresa, Etapa, EtapaId } from '@/types'

/** Solta na coluna que está embaixo do mouse/dedo; se não houver, na que o card mais cobre. */
const colisao: CollisionDetection = (args) => {
  const sob = pointerWithin(args)
  return sob.length ? sob : rectIntersection(args)
}

function CardArrastavel({ empresa }: { empresa: Empresa }) {
  const { abrir } = useFicha()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: empresa.id, data: { empresa } })
  return (
    <motion.div layout="position" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <CardFunil
        ref={setNodeRef}
        empresa={empresa}
        fantasma={isDragging}
        onClick={() => abrir(empresa.id)}
        {...attributes}
        {...listeners}
        onKeyDown={(e) => {
          if (e.key === 'Enter') abrir(empresa.id)
          else listeners?.onKeyDown?.(e)
        }}
        aria-roledescription="card arrastável"
        aria-label={`${empresa.nome}. Aperte espaço para mover de etapa ou Enter para abrir a ficha.`}
      />
    </motion.div>
  )
}

function Coluna({ etapa, empresas }: { etapa: Etapa; empresas: Empresa[] }) {
  const { abrirNovaEmpresa } = useUi()
  const { setNodeRef, isOver } = useDroppable({ id: etapa.id })
  const total = empresas.reduce((s, e) => s + e.valorEstimado, 0)

  return (
    <section
      aria-label={`${etapa.nome}: ${empresas.length} empresas`}
      className="flex w-[84vw] max-w-[310px] shrink-0 snap-start flex-col sm:w-[300px]"
    >
      <header className="mb-3 flex items-center gap-2.5 rounded-[14px] border border-border bg-surface px-4 py-3">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: COR_ETAPA[etapa.id] }} aria-hidden />
        <h2 className="min-w-0 flex-1 truncate font-display text-[15px] font-bold">{etapa.nome}</h2>
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-surface-3 px-1.5 text-xs font-bold text-muted-foreground tabular">
          {empresas.length}
        </span>
        <span className="font-display text-[13px] font-semibold text-[#d4d4d4] tabular">{formatarMoedaCurta(total)}</span>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[220px] flex-1 flex-col gap-2.5 rounded-[16px] border border-dashed border-transparent p-1.5 transition-colors duration-200',
          isOver && 'border-primary/50 bg-primary/[0.04]',
        )}
      >
        <AnimatePresence initial={false}>
          {empresas.map((e) => (
            <CardArrastavel key={e.id} empresa={e} />
          ))}
        </AnimatePresence>
        {empresas.length === 0 && !isOver && (
          <p className="px-3 py-8 text-center text-[13px] text-[#6b6b6b]">Arraste uma empresa para cá</p>
        )}
        {etapa.id === 'nova' && (
          <button
            type="button"
            onClick={() => abrirNovaEmpresa('nova')}
            className="flex h-11 items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#2e2e2e] text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Plus className="size-4" /> Nova empresa
          </button>
        )}
      </div>
    </section>
  )
}

export function Kanban({ empresas }: { empresas: Empresa[] }) {
  const { config, moverEtapa } = useCrm()
  const [ativa, setAtiva] = useState<Empresa | null>(null)

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const porEtapa = useMemo(() => {
    const mapa = new Map<EtapaId, Empresa[]>(config.etapas.map((e) => [e.id, []]))
    for (const e of empresas) if (e.etapaId) mapa.get(e.etapaId)?.push(e)
    return mapa
  }, [empresas, config.etapas])

  const nome = (id: EtapaId) => config.etapas.find((e) => e.id === id)?.nome ?? id

  function inicio(ev: DragStartEvent) {
    setAtiva((ev.active.data.current?.empresa as Empresa) ?? null)
  }

  function fim(ev: DragEndEvent) {
    setAtiva(null)
    const empresa = ev.active.data.current?.empresa as Empresa | undefined
    const destino = ev.over?.id as EtapaId | undefined
    if (!empresa || !destino || destino === empresa.etapaId) return
    void moverEtapa(empresa.id, destino)
    if (destino === 'fechado') {
      toast.success('Negócio fechado! Parabéns!', { description: `${empresa.nome} agora é cliente da BM Vagas.` })
    } else {
      toast.success(`Empresa movida para ${nome(destino)}`, { description: empresa.nome })
    }
  }

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={colisao}
      onDragStart={inicio}
      onDragEnd={fim}
      onDragCancel={() => setAtiva(null)}
      accessibility={{
        screenReaderInstructions: {
          draggable: 'Para mover, aperte espaço. Use as setas para trocar de coluna e espaço de novo para soltar. Esc cancela.',
        },
        announcements: {
          onDragStart: ({ active }) => `Pegou ${(active.data.current?.empresa as Empresa)?.nome}.`,
          onDragOver: ({ over }) => (over ? `Sobre a coluna ${nome(over.id as EtapaId)}.` : 'Fora das colunas.'),
          onDragEnd: ({ over }) => (over ? `Solto em ${nome(over.id as EtapaId)}.` : 'Movimento cancelado.'),
          onDragCancel: () => 'Movimento cancelado.',
        },
      }}
    >
      <div className="scrollbar-thin -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 sm:-mx-6 sm:px-6 lg:-mx-10 lg:snap-none lg:px-10">
        {config.etapas.map((etapa) => (
          <Coluna key={etapa.id} etapa={etapa} empresas={porEtapa.get(etapa.id) ?? []} />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {ativa ? <CardFunil empresa={ativa} arrastando className="w-[280px]" /> : null}
      </DragOverlay>
    </DndContext>
  )
}
