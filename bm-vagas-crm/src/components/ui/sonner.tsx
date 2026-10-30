import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      offset={{ bottom: 24 }}
      mobileOffset={{ bottom: 92 }}
      toastOptions={{
        classNames: {
          toast:
            '!bg-[#1C1C1C] !border !border-[#2e2e2e] !text-white !rounded-[14px] !shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] !font-sans !text-[15px] !gap-3',
          description: '!text-[#A3A3A3]',
          success: '[&_[data-icon]]:!text-[#22C55E]',
          error: '[&_[data-icon]]:!text-[#EF4444]',
          actionButton: '!bg-[#FF5A00] !text-white !rounded-[8px] !font-semibold',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
