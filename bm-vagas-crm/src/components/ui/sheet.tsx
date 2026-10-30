import * as React from 'react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

const Sheet = SheetPrimitive.Root
const SheetClose = SheetPrimitive.Close

function SheetContent({ className, children, ...props }: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed inset-0 z-40 flex flex-col bg-surface outline-none shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.9)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'sm:left-auto sm:w-[600px] sm:max-w-[100vw] sm:border-l sm:border-border',
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

const SheetTitle = SheetPrimitive.Title
const SheetDescription = SheetPrimitive.Description

export { Sheet, SheetClose, SheetContent, SheetTitle, SheetDescription }
