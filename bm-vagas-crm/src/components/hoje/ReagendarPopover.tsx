import { useId, useState, type ReactNode } from 'react'
import { addDays } from 'date-fns'
import { toast } from 'sonner'
import { CalendarDays } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCrm } from '@/store/CrmProvider'
import { diaISO, fraseProximoContato, hojeISO } from '@/lib/datas'
import type { Empresa } from '@/types'

export function ReagendarPopover({ empresa, children }: { empresa: Empresa; children: ReactNode }) {
  const { reagendar } = useCrm()
  const [aberto, setAberto] = useState(false)
  const [data, setData] = useState(diaISO(addDays(new Date(), 2)))
  const idData = useId()

  async function para(dia: string) {
    await reagendar(empresa.id, dia)
    setAberto(false)
    toast.success('Contato reagendado', { description: `${empresa.nome}. ${fraseProximoContato(dia)}.` })
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="mb-2.5 px-1 text-sm font-semibold text-foreground">Falar com a {empresa.nome} em…</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            ['Amanhã', 1],
            ['3 dias', 3],
            ['1 semana', 7],
          ].map(([nome, dias]) => (
            <Button key={nome} variant="secondary" size="sm" onClick={() => para(diaISO(addDays(new Date(), Number(dias))))}>
              {nome}
            </Button>
          ))}
        </div>
        <div className="mt-3 flex items-end gap-2 border-t border-border pt-3">
          <div className="flex-1">
            <label htmlFor={idData} className="mb-1 block text-xs text-muted-foreground">
              Outra data
            </label>
            <Input id={idData} type="date" min={hojeISO()} value={data} onChange={(e) => setData(e.target.value)} className="h-10" />
          </div>
          <Button size="icon" className="size-10" aria-label="Confirmar data" onClick={() => data && para(data)}>
            <CalendarDays className="size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
