import * as React from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/** Botões de escolha lado a lado (ex.: Kanban / Lista, 10 / 20 / 50). */
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('inline-flex items-center gap-1 rounded-full bg-surface-3/70 p-1', className)}
      {...props}
    />
  )
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex h-9 min-w-9 flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-muted-foreground transition-all outline-none',
        'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
        'data-[state=on]:bg-surface data-[state=on]:text-foreground data-[state=on]:shadow-[0_1px_3px_rgba(60,40,20,0.08)]',
        'whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
