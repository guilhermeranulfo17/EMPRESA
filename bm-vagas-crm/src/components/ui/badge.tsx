import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2 text-muted-foreground',
        brand: 'border-primary/30 bg-primary/10 text-[#FF8A4C]',
        success: 'border-success/30 bg-success/10 text-[#4ADE80]',
        warning: 'border-warning/30 bg-warning/10 text-[#FACC15]',
        danger: 'border-danger/35 bg-danger/12 text-[#F87171]',
        info: 'border-info/30 bg-info/10 text-[#60A5FA]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
