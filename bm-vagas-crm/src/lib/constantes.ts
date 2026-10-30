import type {
  DiaSemana,
  Etapa,
  EtapaId,
  Porte,
  Regiao,
  Segmento,
  Servico,
  ServicoId,
  TipoInteracao,
  UF,
} from '@/types'

export const ETAPAS_PADRAO: Etapa[] = [
  { id: 'nova', nome: 'Nova empresa', ordem: 0, modeloId: 'm_primeiro' },
  { id: 'primeiro_contato', nome: 'Primeiro contato', ordem: 1, modeloId: 'm_retomar' },
  { id: 'qualificacao', nome: 'Qualificação', ordem: 2, modeloId: 'm_qualificar' },
  { id: 'apresentacao', nome: 'Apresentação', ordem: 3, modeloId: 'm_reuniao' },
  { id: 'negociacao', nome: 'Negociação', ordem: 4, modeloId: 'm_proposta' },
  { id: 'fechado', nome: 'Fechado', ordem: 5, modeloId: 'm_pos_venda' },
  { id: 'perdido', nome: 'Perdido', ordem: 6, modeloId: 'm_retomar' },
]

/** Etapas em que a empresa ainda pede contato. */
export const ETAPAS_ATIVAS: EtapaId[] = ['nova', 'primeiro_contato', 'qualificacao', 'apresentacao', 'negociacao']

/** Cor discreta de cada etapa (um pontinho no cabeçalho da coluna). */
export const COR_ETAPA: Record<EtapaId, string> = {
  nova: '#B8B0A5',
  primeiro_contato: '#3B82F6',
  qualificacao: '#8B9CF7',
  apresentacao: '#EAB308',
  negociacao: '#FF5A00',
  fechado: '#22C55E',
  perdido: '#EF4444',
}

export const SERVICOS: Servico[] = [
  { id: 'recrutamento', nome: 'Recrutamento e Seleção', curto: 'Recrutamento', grupo: 'Recrutamento e Seleção' },
  { id: 'temporaria', nome: 'Mão de Obra Temporária', curto: 'Temporários', grupo: 'Mão de Obra Temporária' },
  { id: 'consultoria_cargos', nome: 'Cargos e salários', curto: 'Cargos e salários', grupo: 'Consultorias' },
  { id: 'consultoria_clima', nome: 'Pesquisa de clima', curto: 'Clima', grupo: 'Consultorias' },
  { id: 'consultoria_desempenho', nome: 'Avaliação de desempenho', curto: 'Desempenho', grupo: 'Consultorias' },
  { id: 'treinamentos', nome: 'Treinamentos e Palestras', curto: 'Treinamentos', grupo: 'Treinamentos e Palestras' },
]

export const SERVICO_POR_ID = Object.fromEntries(SERVICOS.map((s) => [s.id, s])) as Record<ServicoId, Servico>

/** Tag colorida de cada serviço: fundo bem leve + texto na cor. */
export const COR_SERVICO: Record<ServicoId, { texto: string; fundo: string; borda: string }> = {
  recrutamento: { texto: '#C24600', fundo: 'rgba(255,90,0,0.09)', borda: 'transparent' },
  temporaria: { texto: '#1D4ED8', fundo: 'rgba(59,130,246,0.09)', borda: 'transparent' },
  consultoria_cargos: { texto: '#15803D', fundo: 'rgba(34,197,94,0.11)', borda: 'transparent' },
  consultoria_clima: { texto: '#15803D', fundo: 'rgba(34,197,94,0.11)', borda: 'transparent' },
  consultoria_desempenho: { texto: '#15803D', fundo: 'rgba(34,197,94,0.11)', borda: 'transparent' },
  treinamentos: { texto: '#A16207', fundo: 'rgba(234,179,8,0.14)', borda: 'transparent' },
}

export const SEGMENTOS: Segmento[] = [
  'Indústria',
  'Varejo',
  'Saúde',
  'Logística',
  'Construção',
  'Alimentação',
  'Tecnologia',
]

export const PORTES: Porte[] = ['Micro', 'Pequena', 'Média', 'Grande']

export const UFS: UF[] = ['MG', 'SP', 'GO', 'PR', 'RJ', 'BA', 'SC', 'DF', 'ES', 'RS', 'MT', 'MS', 'PE', 'CE']

export const NOME_UF: Record<UF, string> = {
  MG: 'Minas Gerais',
  SP: 'São Paulo',
  GO: 'Goiás',
  PR: 'Paraná',
  RJ: 'Rio de Janeiro',
  BA: 'Bahia',
  SC: 'Santa Catarina',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  RS: 'Rio Grande do Sul',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  PE: 'Pernambuco',
  CE: 'Ceará',
}

export const REGIAO_UF: Record<UF, Regiao> = {
  MG: 'Sudeste',
  SP: 'Sudeste',
  RJ: 'Sudeste',
  ES: 'Sudeste',
  PR: 'Sul',
  SC: 'Sul',
  RS: 'Sul',
  GO: 'Centro-Oeste',
  DF: 'Centro-Oeste',
  MT: 'Centro-Oeste',
  MS: 'Centro-Oeste',
  BA: 'Nordeste',
  PE: 'Nordeste',
  CE: 'Nordeste',
}

export const REGIOES: Regiao[] = ['Sudeste', 'Sul', 'Centro-Oeste', 'Nordeste']

export const TIPOS_INTERACAO: { id: TipoInteracao; nome: string }[] = [
  { id: 'whatsapp', nome: 'WhatsApp' },
  { id: 'ligacao', nome: 'Ligação' },
  { id: 'email', nome: 'E-mail' },
  { id: 'reuniao', nome: 'Reunião' },
  { id: 'anotacao', nome: 'Anotação' },
]

export const NOME_TIPO_INTERACAO: Record<TipoInteracao, string> = {
  whatsapp: 'WhatsApp',
  ligacao: 'Ligação',
  email: 'E-mail',
  reuniao: 'Reunião',
  anotacao: 'Anotação',
}

export const DIAS_SEMANA: { id: DiaSemana; curto: string; nome: string }[] = [
  { id: 1, curto: 'Seg', nome: 'Segunda' },
  { id: 2, curto: 'Ter', nome: 'Terça' },
  { id: 3, curto: 'Qua', nome: 'Quarta' },
  { id: 4, curto: 'Qui', nome: 'Quinta' },
  { id: 5, curto: 'Sex', nome: 'Sexta' },
  { id: 6, curto: 'Sáb', nome: 'Sábado' },
  { id: 0, curto: 'Dom', nome: 'Domingo' },
]
