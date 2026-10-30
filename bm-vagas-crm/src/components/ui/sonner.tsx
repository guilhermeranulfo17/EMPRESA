import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      offset={{ bottom: 24 }}
      mobileOffset={{ bottom: 92 }}
      toastOptions={{
        classNames: {
          toast:
            '!bg-white !border !border-[#ebe7e1] !text-[#1a1714] !rounded-[16px] !shadow-[0_18px_40px_-14px_rgba(60,40,20,0.18)] !font-sans !text-[15px] !gap-3',
          description: '!text-muted-foreground',
          success: '[&_[data-icon]]:!text-success-ink',
          error: '[&_[data-icon]]:!text-danger-ink',
          actionButton: '!bg-[#FF5A00] !text-white !rounded-full !font-semibold',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
