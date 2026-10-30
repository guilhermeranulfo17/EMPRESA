import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { MotionConfig } from 'framer-motion'
import { CrmProvider } from '@/store/CrmProvider'
import { UiProvider } from '@/store/UiProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import Hoje from '@/pages/Hoje'
import Funil from '@/pages/Funil'
import Empresas from '@/pages/Empresas'
import Assistentes from '@/pages/Assistentes'
import Configuracoes from '@/pages/Configuracoes'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <CrmProvider>
          <UiProvider>
            <TooltipProvider delayDuration={250}>
              <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<Hoje />} />
                    <Route path="funil" element={<Funil />} />
                    <Route path="empresas" element={<Empresas />} />
                    <Route path="assistentes" element={<Assistentes />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
              </Routes>
              <Toaster />
            </TooltipProvider>
          </UiProvider>
        </CrmProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
