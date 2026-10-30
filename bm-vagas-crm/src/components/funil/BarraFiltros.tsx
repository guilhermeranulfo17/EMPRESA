import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NOME_UF, REGIOES, SERVICOS, UFS } from '@/lib/constantes'
import { useCrm } from '@/store/CrmProvider'
import { FILTROS_VAZIOS, temFiltro, type Filtros } from './filtros'

export function BarraFiltros({ filtros, onChange }: { filtros: Filtros; onChange: (f: Filtros) => void }) {
  const { config } = useCrm()
  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) => onChange({ ...filtros, [k]: v })

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <div className="relative flex-1 lg:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#6b6b6b]" aria-hidden />
        <label htmlFor="busca-funil" className="sr-only">
          Buscar empresa, pessoa ou cidade
        </label>
        <Input
          id="busca-funil"
          value={filtros.busca}
          onChange={(e) => set('busca', e.target.value)}
          placeholder="Buscar empresa, pessoa ou cidade"
          className="pl-10"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:flex">
        <Select value={filtros.local} onValueChange={(v) => set('local', v as Filtros['local'])}>
          <SelectTrigger aria-label="Filtrar por estado ou região" className="col-span-2 lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo o Brasil</SelectItem>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Regiões</SelectLabel>
              {REGIOES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Estados</SelectLabel>
              {UFS.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf} · {NOME_UF[uf]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={filtros.responsavel} onValueChange={(v) => set('responsavel', v as Filtros['responsavel'])}>
          <SelectTrigger aria-label="Filtrar por responsável" className="lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">As duas</SelectItem>
            {config.usuarias.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtros.servico} onValueChange={(v) => set('servico', v as Filtros['servico'])}>
          <SelectTrigger aria-label="Filtrar por serviço de interesse" className="lg:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os serviços</SelectItem>
            {SERVICOS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {temFiltro(filtros) && (
        <Button variant="ghost" onClick={() => onChange(FILTROS_VAZIOS)} className="self-start lg:self-auto">
          <X />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
