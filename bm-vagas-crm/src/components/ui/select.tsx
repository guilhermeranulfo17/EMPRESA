import * as React from 'react'
import { Select as SelectPrimitive } from 'radix-ui'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-11 w-full items-center justify-between gap-2 rounded-[12px] border border-transparent bg-surface-2 px-3.5 text-[15px] text-foreground whitespace-nowrap outline-none transition-colors',
        'hover:border-input focus-visible:border-primary/60 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-primary/25',
        'data-[placeholder]:text-subtle disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          'relative z-[60] max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[8rem] overflow-hidden rounded-[12px] border border-border bg-popover text-popover-foreground shadow-[0_20px_50px_-12px_rgba(60,40,20,0.12)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1.5',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1.5 scrollbar-thin">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase', className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[8px] py-2 pr-9 pl-2.5 text-[15px] outline-none select-none',
        'focus:bg-surface-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2.5 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn('mx-1 my-1 h-px bg-border', className)} {...props} />
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator }
