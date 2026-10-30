import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-surface-2 text-muted-foreground',
        brand: 'border-transparent bg-primary/10 text-primary-ink',
        success: 'border-transparent bg-success/12 text-success-ink',
        warning: 'border-transparent bg-warning/15 text-warning-ink',
        danger: 'border-transparent bg-danger/10 text-danger-ink',
        info: 'border-transparent bg-info/10 text-info-ink',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
