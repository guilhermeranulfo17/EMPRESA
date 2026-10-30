import { Building2, KanbanSquare, Settings, Sparkles, Sun, type LucideIcon } from 'lucide-react'

export interface ItemNav {
  para: string
  nome: string
  curto: string
  icone: LucideIcon
}

export const ITENS_NAV: ItemNav[] = [
  { para: '/', nome: 'Hoje', curto: 'Hoje', icone: Sun },
  { para: '/funil', nome: 'Funil', curto: 'Funil', icone: KanbanSquare },
  { para: '/empresas', nome: 'Empresas', curto: 'Empresas', icone: Building2 },
  { para: '/assistentes', nome: 'Assistentes', curto: 'Assistentes', icone: Sparkles },
  { para: '/configuracoes', nome: 'Configurações', curto: 'Ajustes', icone: Settings },
]
