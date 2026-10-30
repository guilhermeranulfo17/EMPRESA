import { Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { useCrm } from '@/store/CrmProvider'
import { AvatarUsuaria } from '@/components/common/AvatarUsuaria'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/** Sem login nesta etapa: cada sócia escolhe quem está usando. */
export function TrocarUsuaria({ compacto = false }: { compacto?: boolean }) {
  const { config, usuariaAtual, trocarUsuaria } = useCrm()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-3 rounded-[12px] text-left transition-colors outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring',
          compacto ? 'p-1' : 'w-full border border-border bg-surface p-2.5',
        )}
        aria-label={`Usando como ${usuariaAtual.nome}. Trocar usuária`}
      >
        <AvatarUsuaria id={usuariaAtual.id} comDica={false} tamanho={compacto ? 'md' : 'lg'} />
        {!compacto && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{usuariaAtual.nome}</span>
              <span className="block truncate text-xs text-muted-foreground">Trocar usuária</span>
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compacto ? 'end' : 'start'} side={compacto ? 'bottom' : 'top'} className="w-56">
        <DropdownMenuLabel>Quem está usando?</DropdownMenuLabel>
        {config.usuarias.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onSelect={() => {
              if (u.id === usuariaAtual.id) return
              trocarUsuaria(u.id)
              toast.success(`Olá, ${u.nome}! Agora você está usando o sistema.`)
            }}
          >
            <AvatarUsuaria id={u.id} comDica={false} tamanho="sm" />
            <span className="flex-1">
              {u.nome} {u.sobrenome}
            </span>
            {u.id === usuariaAtual.id && <Check className="!text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
