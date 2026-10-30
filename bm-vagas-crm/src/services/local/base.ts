import { gerarDadosIniciais } from '../mock/dados'
import { CHAVES, apagarTudo, existe, gravar, ler } from '../armazenamento'
import type { Assistente, Configuracoes, Empresa, Interacao } from '@/types'
import { CONFIGURACOES } from '../mock/dados'

export function semear() {
  const dados = gerarDadosIniciais()
  gravar(CHAVES.empresas, dados.empresas)
  gravar(CHAVES.interacoes, dados.interacoes)
  gravar(CHAVES.assistentes, dados.assistentes)
  gravar(CHAVES.configuracoes, dados.configuracoes)
}

export function garantirSemente() {
  if (!existe(CHAVES.empresas)) semear()
}

export function resetar() {
  apagarTudo()
  semear()
}

export const tabela = {
  empresas: () => ler<Empresa[]>(CHAVES.empresas, []),
  salvarEmpresas: (lista: Empresa[]) => gravar(CHAVES.empresas, lista),
  interacoes: () => ler<Interacao[]>(CHAVES.interacoes, []),
  salvarInteracoes: (lista: Interacao[]) => gravar(CHAVES.interacoes, lista),
  assistentes: () => ler<Assistente[]>(CHAVES.assistentes, []),
  salvarAssistentes: (lista: Assistente[]) => gravar(CHAVES.assistentes, lista),
  configuracoes: () => ler<Configuracoes>(CHAVES.configuracoes, CONFIGURACOES),
  salvarConfiguracoes: (c: Configuracoes) => gravar(CHAVES.configuracoes, c),
}
