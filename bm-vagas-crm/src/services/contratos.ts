/*
 * Contratos da camada de dados. As telas só conhecem estas interfaces.
 * Hoje a implementação é local (localStorage); para usar o Supabase, crie
 * outra implementação com as mesmas funções e troque em services/index.ts.
 */
import type {
  Assistente,
  Configuracoes,
  Empresa,
  EtapaId,
  Interacao,
  NovaEmpresa,
  RotinaDoDia,
  RotinaItemId,
  StatusBase,
  TipoInteracao,
  UsuariaId,
} from '@/types'

export interface LinhaImportacao {
  nome: string
  cidade?: string
  uf?: string
  segmento?: string
  decisor?: string
  cargo?: string
  telefone?: string
  email?: string
  site?: string
  cnpj?: string
}

export interface ResultadoImportacao {
  importadas: number
  duplicadas: number
  invalidas: number
  empresas: Empresa[]
}

export interface RegistroContato {
  empresaId: string
  tipo: TipoInteracao
  texto: string
  autoraId: UsuariaId
  /** yyyy-MM-dd ou null para "sem próximo contato". */
  proximoContato: string | null
  proximaAcao?: string
  novaEtapa?: EtapaId
}

export interface EmpresasService {
  listar(): Promise<Empresa[]>
  criar(dados: NovaEmpresa): Promise<Empresa>
  atualizar(id: string, alteracoes: Partial<Empresa>): Promise<Empresa>
  moverEtapa(id: string, etapaId: EtapaId): Promise<Empresa>
  reagendar(id: string, dia: string): Promise<Empresa>
  mudarStatus(ids: string[], status: StatusBase, responsavelId: UsuariaId): Promise<Empresa[]>
  importar(linhas: LinhaImportacao[], responsavelId: UsuariaId, status: StatusBase): Promise<ResultadoImportacao>
}

export interface InteracoesService {
  listar(): Promise<Interacao[]>
  criar(dados: Omit<Interacao, 'id'>): Promise<Interacao>
  /** Registra uma conversa e já agenda o próximo contato da empresa. */
  registrarContato(dados: RegistroContato): Promise<{ interacao: Interacao; empresa: Empresa }>
}

export interface AssistentesService {
  listar(): Promise<Assistente[]>
  salvar(assistente: Assistente): Promise<Assistente>
}

export interface ConfiguracoesService {
  obter(): Promise<Configuracoes>
  salvar(config: Configuracoes): Promise<Configuracoes>
}

export interface RotinaService {
  obter(dia: string): Promise<RotinaDoDia>
  marcar(dia: string, item: RotinaItemId, feito: boolean): Promise<RotinaDoDia>
}

export interface SessaoService {
  usuariaAtual(): UsuariaId
  trocarUsuaria(id: UsuariaId): void
  /** Preferências de tela (ex.: ver o funil em colunas ou lista). Ficam só neste aparelho. */
  preferencia<T>(chave: string, padrao: T): T
  salvarPreferencia<T>(chave: string, valor: T): void
}

export interface DadosService {
  /** Carrega os dados de exemplo na primeira vez. */
  preparar(): Promise<void>
  /** Apaga tudo e volta para os dados de exemplo. */
  restaurarExemplo(): Promise<void>
}
