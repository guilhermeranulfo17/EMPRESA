import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-[12px] border border-transparent bg-surface-2 px-3.5 text-[15px] text-foreground placeholder:text-subtle transition-colors outline-none',
        'focus-visible:border-primary/60 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
