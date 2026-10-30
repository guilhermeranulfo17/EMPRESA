import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-semibold transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_6px_20px_-8px_rgba(255,90,0,0.7)] hover:bg-primary-hover hover:shadow-[0_10px_26px_-8px_rgba(255,90,0,0.8)]',
        secondary: 'bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-[#333]',
        outline: 'border border-border bg-transparent text-foreground hover:bg-surface-2 hover:border-[#333]',
        ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
        success: 'bg-success/12 text-[#4ADE80] border border-success/25 hover:bg-success/20',
        whatsapp: 'bg-[#25D366]/12 text-[#4BE38A] border border-[#25D366]/25 hover:bg-[#25D366]/20',
        destructive: 'bg-danger/12 text-[#F87171] border border-danger/25 hover:bg-danger/20',
        link: 'text-primary underline-offset-4 hover:underline px-0',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3 text-[13px] rounded-[10px]',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-7 text-base rounded-[14px]',
        icon: 'size-11',
        'icon-sm': 'size-9 rounded-[10px]',
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
