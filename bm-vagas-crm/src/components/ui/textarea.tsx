import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-24 w-full rounded-[12px] border border-transparent bg-surface-2 px-3.5 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-subtle outline-none transition-colors resize-none',
        'focus-visible:border-primary/60 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
