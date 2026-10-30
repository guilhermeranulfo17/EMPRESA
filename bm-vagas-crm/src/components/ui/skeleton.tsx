import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-[10px] bg-surface-2 before:absolute before:inset-0 before:-translate-x-full before:animate-[brilho_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
