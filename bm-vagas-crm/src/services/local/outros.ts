import type { AssistentesService, ConfiguracoesService, DadosService, RotinaService, SessaoService } from '../contratos'
import { CHAVES, esperar, gravar, ler } from '../armazenamento'
import { garantirSemente, resetar, tabela } from './base'
import type { RotinaDoDia, UsuariaId } from '@/types'

const ROTINA_VAZIA: RotinaDoDia = { revisar: false, registrar: false, mover: false, novas: false }

export const assistentesLocal: AssistentesService = {
  async listar() {
    return tabela.assistentes()
  },
  async salvar(assistente) {
    const lista = tabela.assistentes().map((a) => (a.id === assistente.id ? assistente : a))
    tabela.salvarAssistentes(lista)
    return assistente
  },
}

export const configuracoesLocal: ConfiguracoesService = {
  async obter() {
    return tabela.configuracoes()
  },
  async salvar(config) {
    tabela.salvarConfiguracoes(config)
    return config
  },
}

export const rotinaLocal: RotinaService = {
  async obter(dia) {
    const todas = ler<Record<string, RotinaDoDia>>(CHAVES.rotina, {})
    return { ...ROTINA_VAZIA, ...todas[dia] }
  },
  async marcar(dia, item, feito) {
    const todas = ler<Record<string, RotinaDoDia>>(CHAVES.rotina, {})
    const doDia = { ...ROTINA_VAZIA, ...todas[dia], [item]: feito }
    // Guarda só os últimos 30 dias para não acumular lixo.
    const dias = Object.keys(todas).sort().slice(-30)
    const enxuto = Object.fromEntries(dias.map((d) => [d, todas[d]]))
    gravar(CHAVES.rotina, { ...enxuto, [dia]: doDia })
    return doDia
  },
}

export const sessaoLocal: SessaoService = {
  usuariaAtual() {
    return ler<UsuariaId>(CHAVES.usuariaAtual, 'marlete')
  },
  trocarUsuaria(id) {
    gravar(CHAVES.usuariaAtual, id)
  },
  preferencia(chave, padrao) {
    return ler(`pref:${chave}`, padrao)
  },
  salvarPreferencia(chave, valor) {
    gravar(`pref:${chave}`, valor)
  },
}

export const dadosLocal: DadosService = {
  async preparar() {
    garantirSemente()
    await esperar()
  },
  async restaurarExemplo() {
    resetar()
    await esperar(250)
  },
}
