import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-surface-2 text-foreground hover:bg-surface-3',
        outline: 'border border-border bg-transparent text-foreground hover:bg-surface-2 hover:border-border-strong',
        ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
        success: 'bg-success/10 text-success-ink hover:bg-success/15',
        whatsapp: 'bg-[#25D366]/10 text-[#128C4A] hover:bg-[#25D366]/16',
        destructive: 'bg-danger/10 text-danger-ink hover:bg-danger/15',
        link: 'text-primary underline-offset-4 hover:underline px-0',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3.5 text-[13px]',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-7 text-base',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
