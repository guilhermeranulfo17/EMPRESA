/*
 * Tipos do domínio. Pensados para virar tabelas no Supabase depois:
 * empresas, interacoes, assistentes, usuarias, etapas e modelos_mensagem.
 */

export type UF = 'MG' | 'SP' | 'GO' | 'PR' | 'RJ' | 'BA' | 'SC' | 'DF' | 'ES' | 'RS' | 'MT' | 'MS' | 'PE' | 'CE'

export type Regiao = 'Sudeste' | 'Sul' | 'Centro-Oeste' | 'Nordeste'

export type Segmento =
  | 'Indústria'
  | 'Varejo'
  | 'Saúde'
  | 'Logística'
  | 'Construção'
  | 'Alimentação'
  | 'Tecnologia'

export type Porte = 'Micro' | 'Pequena' | 'Média' | 'Grande'

export type UsuariaId = 'rosali' | 'marlete'

export interface Usuaria {
  id: UsuariaId
  nome: string
  sobrenome: string
  telefone: string
  email: string
}

export type EtapaId =
  | 'nova'
  | 'primeiro_contato'
  | 'qualificacao'
  | 'apresentacao'
  | 'negociacao'
  | 'fechado'
  | 'perdido'

export interface Etapa {
  id: EtapaId
  nome: string
  ordem: number
  /** Modelo de mensagem sugerido para quem está nesta etapa. */
  modeloId?: string
}

export type ServicoId =
  | 'recrutamento'
  | 'temporaria'
  | 'consultoria_cargos'
  | 'consultoria_clima'
  | 'consultoria_desempenho'
  | 'treinamentos'

export interface Servico {
  id: ServicoId
  nome: string
  curto: string
  grupo: 'Recrutamento e Seleção' | 'Mão de Obra Temporária' | 'Consultorias' | 'Treinamentos e Palestras'
}

/** Onde a empresa está na base: só na fila, já contatada ou dentro do funil. */
export type StatusBase = 'fila' | 'contatada' | 'funil'

export type OrigemEmpresa = 'manual' | 'importacao' | 'rafael'

/** O decisor da empresa (a pessoa com quem elas falam). */
export interface Contato {
  nome: string
  cargo: string
  telefone: string
  email?: string
  linkedin?: string
}

export type TipoInteracao = 'ligacao' | 'whatsapp' | 'email' | 'reuniao' | 'anotacao'

export interface Interacao {
  id: string
  empresaId: string
  tipo: TipoInteracao
  /** Data e hora em ISO. */
  data: string
  texto: string
  autoraId: UsuariaId
}

export interface Empresa {
  id: string
  nome: string
  cnpj?: string
  segmento: Segmento
  porte: Porte
  cidade: string
  uf: UF
  site?: string
  decisor: Contato
  servicos: ServicoId[]
  status: StatusBase
  /** Só existe quando a empresa está no funil. */
  etapaId: EtapaId | null
  /** Desde quando está na etapa atual (ISO). */
  etapaDesde: string | null
  responsavelId: UsuariaId
  valorEstimado: number
  /** Dia do próximo contato (yyyy-MM-dd). */
  proximoContato: string | null
  proximaAcao: string
  origem: OrigemEmpresa
  criadaEm: string
}

export type NovaEmpresa = Omit<Empresa, 'id' | 'criadaEm' | 'etapaDesde'> & { etapaDesde?: string | null }

export interface ModeloMensagem {
  id: string
  nome: string
  texto: string
}

/* ---------- Assistentes ---------- */

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface RegistroDisparo {
  id: string
  data: string
  enviadas: number
  respostas: number
}

export interface RegistroBusca {
  id: string
  data: string
  encontradas: number
  estados: UF[]
}

export interface ConfigLivia {
  horario: string
  quantidadePorDia: 10 | 20 | 50
  dias: DiaSemana[]
  modelo: string
}

export interface ConfigRafael {
  diaSemana: DiaSemana
  estados: UF[]
  cidades: string[]
  segmentos: Segmento[]
  quantidadePorSemana: 25 | 50 | 100
}

interface AssistenteBase {
  nome: string
  funcao: string
  ativo: boolean
}

export interface AssistenteLivia extends AssistenteBase {
  id: 'livia'
  config: ConfigLivia
  historico: RegistroDisparo[]
}

export interface AssistenteRafael extends AssistenteBase {
  id: 'rafael'
  config: ConfigRafael
  historico: RegistroBusca[]
}

export type Assistente = AssistenteLivia | AssistenteRafael

/* ---------- Configurações e rotina ---------- */

export interface Configuracoes {
  usuarias: Usuaria[]
  etapas: Etapa[]
  modelos: ModeloMensagem[]
}

export type RotinaItemId = 'revisar' | 'registrar' | 'mover' | 'novas'

/** Checklist do dia: quais itens já foram feitos, por data. */
export type RotinaDoDia = Record<RotinaItemId, boolean>

export type ProximoContatoAtalho = 'amanha' | '3dias' | '1semana' | 'data'
