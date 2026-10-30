import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type LinhaImportacao, type RegistroContato } from '@/services'
import type {
  Assistente,
  Configuracoes,
  Empresa,
  EtapaId,
  Interacao,
  NovaEmpresa,
  StatusBase,
  Usuaria,
  UsuariaId,
} from '@/types'
import { CONFIGURACOES } from '@/services/mock/dados'

/*
 * Estado compartilhado entre as telas. Toda leitura e escrita passa por `api`
 * (pasta services); aqui só guardamos o resultado na memória da tela.
 */

interface CrmEstado {
  carregando: boolean
  empresas: Empresa[]
  interacoes: Interacao[]
  assistentes: Assistente[]
  config: Configuracoes
  usuariaAtual: Usuaria
}

interface CrmAcoes {
  trocarUsuaria(id: UsuariaId): void
  criarEmpresa(dados: NovaEmpresa): Promise<Empresa>
  atualizarEmpresa(id: string, alteracoes: Partial<Empresa>): Promise<Empresa>
  moverEtapa(id: string, etapaId: EtapaId): Promise<Empresa>
  reagendar(id: string, dia: string): Promise<Empresa>
  mudarStatus(ids: string[], status: StatusBase): Promise<Empresa[]>
  importar(linhas: LinhaImportacao[], status: StatusBase): ReturnType<typeof api.empresas.importar>
  registrarContato(dados: Omit<RegistroContato, 'autoraId'>): Promise<Empresa>
  salvarAssistente(a: Assistente): Promise<void>
  salvarConfig(c: Configuracoes): Promise<void>
  restaurarExemplo(): Promise<void>
}

type Crm = CrmEstado & CrmAcoes

const CrmContext = createContext<Crm | null>(null)

export function CrmProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  const [assistentes, setAssistentes] = useState<Assistente[]>([])
  const [config, setConfig] = useState<Configuracoes>(CONFIGURACOES)
  const [usuariaId, setUsuariaId] = useState<UsuariaId>(() => api.sessao.usuariaAtual())

  const carregar = useCallback(async () => {
    setCarregando(true)
    await api.dados.preparar()
    const [e, i, a, c] = await Promise.all([
      api.empresas.listar(),
      api.interacoes.listar(),
      api.assistentes.listar(),
      api.configuracoes.obter(),
    ])
    setEmpresas(e)
    setInteracoes(i)
    setAssistentes(a)
    setConfig(c)
    setCarregando(false)
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const trocarEmpresa = useCallback((nova: Empresa) => {
    setEmpresas((lista) => lista.map((e) => (e.id === nova.id ? nova : e)))
    return nova
  }, [])

  const usuariaAtual = useMemo(
    () => config.usuarias.find((u) => u.id === usuariaId) ?? config.usuarias[0],
    [config.usuarias, usuariaId],
  )

  const valor = useMemo<Crm>(
    () => ({
      carregando,
      empresas,
      interacoes,
      assistentes,
      config,
      usuariaAtual,

      trocarUsuaria(id) {
        api.sessao.trocarUsuaria(id)
        setUsuariaId(id)
      },
      async criarEmpresa(dados) {
        const nova = await api.empresas.criar(dados)
        setEmpresas((lista) => [nova, ...lista])
        return nova
      },
      async atualizarEmpresa(id, alteracoes) {
        return trocarEmpresa(await api.empresas.atualizar(id, alteracoes))
      },
      async moverEtapa(id, etapaId) {
        // Atualiza a tela antes para o card não "voltar" depois de solto.
        setEmpresas((lista) =>
          lista.map((e) => (e.id === id ? { ...e, etapaId, etapaDesde: new Date().toISOString() } : e)),
        )
        return trocarEmpresa(await api.empresas.moverEtapa(id, etapaId))
      },
      async reagendar(id, dia) {
        return trocarEmpresa(await api.empresas.reagendar(id, dia))
      },
      async mudarStatus(ids, status) {
        const alteradas = await api.empresas.mudarStatus(ids, status, usuariaId)
        const porId = new Map(alteradas.map((e) => [e.id, e]))
        setEmpresas((lista) => lista.map((e) => porId.get(e.id) ?? e))
        return alteradas
      },
      async importar(linhas, status) {
        const resultado = await api.empresas.importar(linhas, usuariaId, status)
        setEmpresas((lista) => [...resultado.empresas, ...lista])
        return resultado
      },
      async registrarContato(dados) {
        const { interacao, empresa } = await api.interacoes.registrarContato({ ...dados, autoraId: usuariaId })
        setInteracoes((lista) => [interacao, ...lista])
        return trocarEmpresa(empresa)
      },
      async salvarAssistente(a) {
        const salvo = await api.assistentes.salvar(a)
        setAssistentes((lista) => lista.map((x) => (x.id === salvo.id ? salvo : x)))
      },
      async salvarConfig(c) {
        setConfig(await api.configuracoes.salvar(c))
      },
      async restaurarExemplo() {
        await api.dados.restaurarExemplo()
        await carregar()
      },
    }),
    [carregando, empresas, interacoes, assistentes, config, usuariaAtual, usuariaId, trocarEmpresa, carregar],
  )

  return <CrmContext.Provider value={valor}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm precisa estar dentro de <CrmProvider>')
  return ctx
}
