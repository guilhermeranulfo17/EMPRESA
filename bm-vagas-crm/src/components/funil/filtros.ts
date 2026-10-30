import { REGIAO_UF, REGIOES } from '@/lib/constantes'
import { normalizar } from '@/lib/utils'
import type { Empresa, Regiao, ServicoId, UF, UsuariaId } from '@/types'

export interface Filtros {
  busca: string
  local: 'todos' | Regiao | UF
  responsavel: 'todas' | UsuariaId
  servico: 'todos' | ServicoId
}

export const FILTROS_VAZIOS: Filtros = { busca: '', local: 'todos', responsavel: 'todas', servico: 'todos' }

export function aplicarFiltros(lista: Empresa[], f: Filtros) {
  const termo = normalizar(f.busca)
  return lista.filter((e) => {
    if (termo) {
      const alvo = normalizar(`${e.nome} ${e.decisor.nome} ${e.cidade}`)
      if (!alvo.includes(termo)) return false
    }
    if (f.local !== 'todos') {
      if ((REGIOES as string[]).includes(f.local)) {
        if (REGIAO_UF[e.uf] !== f.local) return false
      } else if (e.uf !== f.local) return false
    }
    if (f.responsavel !== 'todas' && e.responsavelId !== f.responsavel) return false
    if (f.servico !== 'todos' && !e.servicos.includes(f.servico)) return false
    return true
  })
}

export function temFiltro(f: Filtros) {
  return f.busca !== '' || f.local !== 'todos' || f.responsavel !== 'todas' || f.servico !== 'todos'
}
