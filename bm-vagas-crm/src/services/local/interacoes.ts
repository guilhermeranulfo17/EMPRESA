import type { InteracoesService } from '../contratos'
import { tabela } from './base'
import { uid } from '@/lib/utils'
import type { Empresa, Interacao } from '@/types'

export const interacoesLocal: InteracoesService = {
  async listar() {
    return tabela.interacoes()
  },

  async criar(dados) {
    const interacao: Interacao = { ...dados, id: uid('int') }
    tabela.salvarInteracoes([interacao, ...tabela.interacoes()])
    return interacao
  },

  async registrarContato({ empresaId, tipo, texto, autoraId, proximoContato, proximaAcao, novaEtapa }) {
    const interacao: Interacao = {
      id: uid('int'),
      empresaId,
      tipo,
      texto: texto.trim() || 'Contato feito.',
      autoraId,
      data: new Date().toISOString(),
    }
    tabela.salvarInteracoes([interacao, ...tabela.interacoes()])

    const empresas = tabela.empresas()
    const i = empresas.findIndex((e) => e.id === empresaId)
    if (i < 0) throw new Error('Empresa não encontrada')
    const atual = empresas[i]
    const agora = new Date().toISOString()
    const empresa: Empresa = {
      ...atual,
      // Quem estava só na base e recebeu contato passa a "já contatada".
      status: atual.status === 'fila' && tipo !== 'anotacao' ? 'contatada' : atual.status,
      proximoContato,
      proximaAcao: proximaAcao?.trim() || atual.proximaAcao,
      ...(novaEtapa && novaEtapa !== atual.etapaId
        ? { etapaId: novaEtapa, etapaDesde: agora, status: 'funil' as const }
        : {}),
    }
    empresas[i] = empresa
    tabela.salvarEmpresas(empresas)
    return { interacao, empresa }
  },
}
