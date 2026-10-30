/*
 * Dados de exemplo. Todas as empresas, pessoas e telefones são inventados.
 * As datas são relativas ao dia em que o sistema é aberto pela primeira vez,
 * para sempre existir contato atrasado, contato de hoje e contato futuro.
 */
import { addDays, setHours, setMinutes, startOfDay, subDays } from 'date-fns'
import { ETAPAS_PADRAO } from '@/lib/constantes'
import { diaISO, inicioDaSemana } from '@/lib/datas'
import type {
  Assistente,
  Configuracoes,
  Empresa,
  EtapaId,
  Interacao,
  ModeloMensagem,
  Porte,
  Segmento,
  ServicoId,
  TipoInteracao,
  UF,
  Usuaria,
  UsuariaId,
} from '@/types'

export const USUARIAS: Usuaria[] = [
  { id: 'rosali', nome: 'Rosali', sobrenome: 'Rocha', telefone: '(34) 99812-4410', email: 'rosali@bmvagas.exemplo' },
  { id: 'marlete', nome: 'Marlete', sobrenome: 'Nascimento', telefone: '(34) 99731-2288', email: 'marlete@bmvagas.exemplo' },
]

export const MODELOS: ModeloMensagem[] = [
  {
    id: 'm_primeiro',
    nome: 'Primeiro contato',
    texto:
      'Olá, {nome}! Tudo bem? Aqui é a {meu_nome}, da BM Vagas (unidade Rocha & Nascimento). Ajudamos empresas como a {empresa} a contratar com mais rapidez e segurança: recrutamento, temporários e consultorias de RH. Posso te mostrar em 10 minutos como funcionaria aí em {cidade}?',
  },
  {
    id: 'm_retomar',
    nome: 'Retomar conversa',
    texto:
      'Oi, {nome}! Passando para retomar nossa conversa sobre as vagas da {empresa}. Consigo te ligar hoje ou amanhã? Qual horário fica melhor para você?',
  },
  {
    id: 'm_qualificar',
    nome: 'Entender a necessidade',
    texto:
      '{nome}, para eu preparar algo certeiro para a {empresa}: quantas vagas vocês costumam abrir por mês e quais são as mais difíceis de preencher hoje?',
  },
  {
    id: 'm_reuniao',
    nome: 'Confirmar reunião',
    texto:
      'Olá, {nome}! Confirmando nossa conversa para apresentar a BM Vagas à {empresa}. Prefere por vídeo ou presencial? Fico à disposição.',
  },
  {
    id: 'm_proposta',
    nome: 'Acompanhar proposta',
    texto:
      '{nome}, conseguiu olhar a proposta que enviei para a {empresa}? Se quiser, ajusto algum ponto. Podemos acertar os detalhes ainda esta semana?',
  },
  {
    id: 'm_pos_venda',
    nome: 'Agradecimento (fechado)',
    texto:
      '{nome}, muito obrigada pela confiança! Já estamos com tudo encaminhado para a {empresa}. Qualquer coisa, é só me chamar por aqui.',
  },
]

export const CONFIGURACOES: Configuracoes = {
  usuarias: USUARIAS,
  etapas: ETAPAS_PADRAO,
  modelos: MODELOS,
}

/* ------------------------------------------------------------------ */

type InteracaoBruta = [diasAtras: number, hora: number, tipo: TipoInteracao, texto: string, autora?: UsuariaId]

interface EmpresaBruta {
  nome: string
  segmento: Segmento
  porte: Porte
  cidade: string
  uf: UF
  site?: string
  cnpj?: string
  decisor: [nome: string, cargo: string, telefone: string, email?: string, linkedin?: string]
  servicos: ServicoId[]
  etapa: EtapaId
  diasNaEtapa: number
  resp: UsuariaId
  valor: number
  /** Dias até o próximo contato (negativo = atrasado). null = sem próximo contato. */
  prox: number | null
  acao: string
  interacoes: InteracaoBruta[]
}

const FUNIL: EmpresaBruta[] = [
  {
    nome: 'Metalúrgica Serra Azul',
    segmento: 'Indústria',
    porte: 'Média',
    cidade: 'Contagem',
    uf: 'MG',
    site: 'serraazulmetais.com.br',
    cnpj: '23456789000112',
    decisor: ['Cláudio Ferreira', 'Gerente de RH', '(31) 98744-1203', 'claudio.ferreira@serraazul.exemplo', 'linkedin.com/in/claudioferreira-rh'],
    servicos: ['recrutamento'],
    etapa: 'negociacao',
    diasNaEtapa: 4,
    resp: 'marlete',
    valor: 18000,
    prox: -2,
    acao: 'Retomar a proposta para 6 operadores de máquina',
    interacoes: [
      [15, 10, 'whatsapp', 'Primeira mensagem. Respondeu no mesmo dia, pediu para ligar.'],
      [12, 14, 'ligacao', 'Conversa de 15 min. Estão com 6 vagas de operador abertas há 2 meses.'],
      [8, 9, 'reuniao', 'Reunião por vídeo com o Cláudio e a diretora. Gostaram do prazo de 15 dias.'],
      [4, 16, 'email', 'Proposta enviada: recrutamento de 6 operadores, garantia de 90 dias.'],
    ],
  },
  {
    nome: 'Supermercados Bom Preço Vale',
    segmento: 'Varejo',
    porte: 'Grande',
    cidade: 'Uberlândia',
    uf: 'MG',
    site: 'bomprecovale.com.br',
    decisor: ['Patrícia Mendes', 'Coordenadora de Gente e Gestão', '(34) 99215-7780', 'patricia@bomprecovale.exemplo'],
    servicos: ['temporaria', 'recrutamento'],
    etapa: 'apresentacao',
    diasNaEtapa: 6,
    resp: 'rosali',
    valor: 24000,
    prox: 0,
    acao: 'Confirmar a reunião de apresentação',
    interacoes: [
      [11, 11, 'ligacao', 'Ligação fria. Atendeu a Patrícia, pediu material por WhatsApp.', 'rosali'],
      [9, 15, 'whatsapp', 'Enviei a apresentação. Ela comentou que o fim de ano aperta: precisam de 30 temporários.', 'rosali'],
      [6, 10, 'whatsapp', 'Marcamos apresentação para esta semana.', 'rosali'],
    ],
  },
  {
    nome: 'Clínica Vida Plena',
    segmento: 'Saúde',
    porte: 'Média',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    site: 'clinicavidaplena.com.br',
    decisor: ['Renata Alves', 'Diretora Administrativa', '(31) 99102-6634', 'renata.alves@vidaplena.exemplo'],
    servicos: ['recrutamento', 'consultoria_clima'],
    etapa: 'qualificacao',
    diasNaEtapa: 3,
    resp: 'marlete',
    valor: 9500,
    prox: 0,
    acao: 'Perguntar quantas vagas abrem por mês',
    interacoes: [
      [6, 9, 'whatsapp', 'Primeiro contato. Respondeu com áudio, disse que a rotatividade na recepção está alta.'],
      [3, 17, 'ligacao', 'Falamos sobre clima: a equipe está desmotivada. Abriu espaço para uma pesquisa de clima.'],
    ],
  },
  {
    nome: 'TransCerrado Logística',
    segmento: 'Logística',
    porte: 'Grande',
    cidade: 'Anápolis',
    uf: 'GO',
    site: 'transcerrado.com.br',
    cnpj: '34567890000123',
    decisor: ['Marcos Vinícius Prado', 'Gerente de Operações', '(62) 98420-3317', 'marcos.prado@transcerrado.exemplo'],
    servicos: ['temporaria'],
    etapa: 'primeiro_contato',
    diasNaEtapa: 12,
    resp: 'rosali',
    valor: 15000,
    prox: -4,
    acao: 'Ligar de novo: não respondeu o WhatsApp',
    interacoes: [
      [12, 10, 'whatsapp', 'Mensagem de apresentação enviada. Visualizou, não respondeu.', 'rosali'],
      [8, 14, 'ligacao', 'Caixa postal. Deixei recado com a recepção.', 'rosali'],
    ],
  },
  {
    nome: 'Construtora Horizonte Paulista',
    segmento: 'Construção',
    porte: 'Grande',
    cidade: 'Campinas',
    uf: 'SP',
    site: 'horizontepaulista.com.br',
    decisor: ['Eduardo Lacerda', 'Diretor de Obras', '(19) 99633-4508', 'eduardo@horizontepaulista.exemplo', 'linkedin.com/in/eduardolacerda'],
    servicos: ['recrutamento', 'treinamentos'],
    etapa: 'negociacao',
    diasNaEtapa: 11,
    resp: 'marlete',
    valor: 32000,
    prox: 1,
    acao: 'Ligar para fechar o valor do treinamento de segurança',
    interacoes: [
      [25, 9, 'ligacao', 'Indicação de um cliente. Eduardo atendeu e já marcou conversa.'],
      [20, 15, 'reuniao', 'Visita na obra. Precisam de 4 mestres de obras e treinamento de NR-35.'],
      [11, 10, 'email', 'Proposta enviada com recrutamento + treinamento.'],
      [5, 16, 'whatsapp', 'Ele pediu desconto de 10% no treinamento. Fiquei de ver.'],
    ],
  },
  {
    nome: 'Laticínios Serra da Canastra',
    segmento: 'Alimentação',
    porte: 'Média',
    cidade: 'Piumhi',
    uf: 'MG',
    decisor: ['Joana Silveira', 'Supervisora de RH', '(37) 99871-0452', 'rh@laticiniosserra.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'nova',
    diasNaEtapa: 2,
    resp: 'rosali',
    valor: 8000,
    prox: 0,
    acao: 'Mandar a primeira mensagem',
    interacoes: [[2, 8, 'anotacao', 'Empresa encontrada pelo Rafael. Contratando para a nova linha de queijos.', 'rosali']],
  },
  {
    nome: 'Nuvem Clara Sistemas',
    segmento: 'Tecnologia',
    porte: 'Pequena',
    cidade: 'Curitiba',
    uf: 'PR',
    site: 'nuvemclara.dev',
    decisor: ['Felipe Kowalski', 'Sócio-fundador', '(41) 99340-8812', 'felipe@nuvemclara.exemplo', 'linkedin.com/in/felipekowalski'],
    servicos: ['recrutamento'],
    etapa: 'qualificacao',
    diasNaEtapa: 7,
    resp: 'marlete',
    valor: 12000,
    prox: 3,
    acao: 'Mandar exemplos de vagas de tecnologia que já fechamos',
    interacoes: [
      [10, 11, 'email', 'E-mail de apresentação. Respondeu pedindo cases de tecnologia.'],
      [7, 16, 'ligacao', 'Precisa de 2 desenvolvedores e 1 analista de suporte até janeiro.'],
    ],
  },
  {
    nome: 'Hospital São Lucas do Oeste',
    segmento: 'Saúde',
    porte: 'Grande',
    cidade: 'Cascavel',
    uf: 'PR',
    site: 'hsaolucasoeste.org.br',
    decisor: ['Sandra Bittencourt', 'Gerente de RH', '(45) 99128-5560', 'sandra.b@hsaolucas.exemplo'],
    servicos: ['consultoria_desempenho', 'treinamentos'],
    etapa: 'apresentacao',
    diasNaEtapa: 2,
    resp: 'rosali',
    valor: 28000,
    prox: 2,
    acao: 'Apresentar a avaliação de desempenho para a diretoria',
    interacoes: [
      [9, 10, 'ligacao', 'Sandra quer implantar avaliação de desempenho em 2027.', 'rosali'],
      [2, 14, 'reuniao', 'Reunião com a Sandra. Pediu para apresentarmos à diretoria.', 'rosali'],
    ],
  },
  {
    nome: 'Moinho Paraná Sul Alimentos',
    segmento: 'Alimentação',
    porte: 'Grande',
    cidade: 'Ponta Grossa',
    uf: 'PR',
    decisor: ['Ricardo Wosniak', 'Gerente Industrial', '(42) 99877-2045', 'ricardo.w@moinhoparanasul.exemplo'],
    servicos: ['temporaria'],
    etapa: 'primeiro_contato',
    diasNaEtapa: 5,
    resp: 'rosali',
    valor: 14000,
    prox: -1,
    acao: 'Mandar mensagem perguntando da safra',
    interacoes: [[5, 9, 'whatsapp', 'Primeira mensagem. Respondeu: "agora não, me chama depois do dia 20".', 'rosali']],
  },
  {
    nome: 'Distribuidora Litoral Fluminense',
    segmento: 'Logística',
    porte: 'Média',
    cidade: 'Niterói',
    uf: 'RJ',
    decisor: ['Alessandra Couto', 'Gerente Administrativa', '(21) 99504-7318', 'alessandra@litoralflu.exemplo'],
    servicos: ['recrutamento', 'temporaria'],
    etapa: 'nova',
    diasNaEtapa: 1,
    resp: 'marlete',
    valor: 10000,
    prox: 0,
    acao: 'Mandar a primeira mensagem',
    interacoes: [],
  },
  {
    nome: 'Ateliê Carioca Moda',
    segmento: 'Varejo',
    porte: 'Pequena',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    decisor: ['Bianca Moreira', 'Sócia-proprietária', '(21) 98110-2290', 'bianca@ateliecarioca.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'perdido',
    diasNaEtapa: 20,
    resp: 'rosali',
    valor: 6000,
    prox: null,
    acao: 'Tentar de novo em março',
    interacoes: [
      [35, 10, 'whatsapp', 'Primeiro contato. Interessada em vendedoras para o Natal.', 'rosali'],
      [20, 15, 'ligacao', 'Decidiu contratar por indicação de conhecidos. Pediu para chamar em março.', 'rosali'],
    ],
  },
  {
    nome: 'Cerâmica Recôncavo',
    segmento: 'Indústria',
    porte: 'Média',
    cidade: 'Feira de Santana',
    uf: 'BA',
    decisor: ['José Raimundo Bastos', 'Diretor', '(75) 99260-1184', 'jose.bastos@ceramicareconcavo.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'primeiro_contato',
    diasNaEtapa: 3,
    resp: 'marlete',
    valor: 11000,
    prox: 4,
    acao: 'Ligar depois da feira do setor',
    interacoes: [[3, 10, 'ligacao', 'Atendeu rápido, está numa feira. Pediu para ligar semana que vem.']],
  },
  {
    nome: 'Rede Farma Bahia',
    segmento: 'Varejo',
    porte: 'Grande',
    cidade: 'Salvador',
    uf: 'BA',
    site: 'redefarmabahia.com.br',
    decisor: ['Luciana Pires', 'Gerente de Recrutamento', '(71) 99188-6043', 'luciana.pires@redefarma.exemplo', 'linkedin.com/in/lucianapires'],
    servicos: ['recrutamento', 'treinamentos'],
    etapa: 'negociacao',
    diasNaEtapa: 3,
    resp: 'rosali',
    valor: 26000,
    prox: 1,
    acao: 'Confirmar se a diretoria aprovou a proposta',
    interacoes: [
      [18, 9, 'email', 'Contato pelo LinkedIn, depois e-mail.', 'rosali'],
      [12, 14, 'reuniao', 'Apresentação para Luciana e o gerente regional.', 'rosali'],
      [3, 11, 'email', 'Proposta enviada: 12 balconistas + treinamento de atendimento.', 'rosali'],
    ],
  },
  {
    nome: 'Têxtil Vale do Itajaí',
    segmento: 'Indústria',
    porte: 'Grande',
    cidade: 'Blumenau',
    uf: 'SC',
    site: 'textilvaleitajai.com.br',
    cnpj: '45678901000134',
    decisor: ['Gustavo Hoffmann', 'Gerente de RH', '(47) 99652-3381', 'gustavo.h@textilvale.exemplo'],
    servicos: ['recrutamento', 'consultoria_cargos'],
    etapa: 'fechado',
    diasNaEtapa: 8,
    resp: 'marlete',
    valor: 22000,
    prox: null,
    acao: 'Acompanhar a primeira entrega de candidatos',
    interacoes: [
      [30, 10, 'ligacao', 'Primeiro contato por indicação.'],
      [22, 15, 'reuniao', 'Apresentação presencial em Blumenau.'],
      [14, 9, 'email', 'Proposta de recrutamento + plano de cargos e salários.'],
      [8, 16, 'ligacao', 'Fechado! Contrato assinado.'],
    ],
  },
  {
    nome: 'Pescados Ilha Bela',
    segmento: 'Alimentação',
    porte: 'Média',
    cidade: 'Itajaí',
    uf: 'SC',
    decisor: ['Mariana Schmitt', 'Coordenadora de RH', '(47) 99134-8820', 'mariana@pescadosilhabela.exemplo'],
    servicos: ['temporaria'],
    etapa: 'qualificacao',
    diasNaEtapa: 9,
    resp: 'rosali',
    valor: 9000,
    prox: 2,
    acao: 'Entender o volume de temporários para o verão',
    interacoes: [
      [13, 10, 'whatsapp', 'Primeira mensagem. Pediu para falar por e-mail.', 'rosali'],
      [9, 11, 'email', 'Enviei a apresentação de mão de obra temporária.', 'rosali'],
    ],
  },
  {
    nome: 'Planalto Tech Soluções',
    segmento: 'Tecnologia',
    porte: 'Média',
    cidade: 'Brasília',
    uf: 'DF',
    site: 'planaltotech.com.br',
    decisor: ['Henrique Damasceno', 'Diretor de Operações', '(61) 99417-2253', 'henrique@planaltotech.exemplo', 'linkedin.com/in/henriquedamasceno'],
    servicos: ['recrutamento', 'consultoria_desempenho'],
    etapa: 'apresentacao',
    diasNaEtapa: 4,
    resp: 'marlete',
    valor: 16000,
    prox: 5,
    acao: 'Apresentação marcada por vídeo',
    interacoes: [
      [10, 9, 'email', 'E-mail de apresentação. Respondeu no dia seguinte.'],
      [4, 15, 'ligacao', 'Marcamos a apresentação por vídeo.'],
    ],
  },
  {
    nome: 'Construtora Ipê Amarelo',
    segmento: 'Construção',
    porte: 'Média',
    cidade: 'Goiânia',
    uf: 'GO',
    decisor: ['Wellington Batista', 'Engenheiro responsável', '(62) 99280-5541', 'wellington@ipeamarelo.exemplo'],
    servicos: ['temporaria', 'treinamentos'],
    etapa: 'nova',
    diasNaEtapa: 0,
    resp: 'rosali',
    valor: 12000,
    prox: 1,
    acao: 'Mandar a primeira mensagem',
    interacoes: [],
  },
  {
    nome: 'Frigorífico Boi Goiano',
    segmento: 'Alimentação',
    porte: 'Grande',
    cidade: 'Rio Verde',
    uf: 'GO',
    site: 'boigoiano.com.br',
    cnpj: '56789012000145',
    decisor: ['Cristiane Alencar', 'Gerente de RH', '(64) 99623-1170', 'cristiane@boigoiano.exemplo'],
    servicos: ['recrutamento', 'temporaria'],
    etapa: 'negociacao',
    diasNaEtapa: 14,
    resp: 'marlete',
    valor: 38000,
    prox: 3,
    acao: 'Esperar a resposta do jurídico sobre o contrato',
    interacoes: [
      [32, 10, 'ligacao', 'Primeiro contato. Alta rotatividade na desossa.'],
      [24, 14, 'reuniao', 'Visita à unidade de Rio Verde.'],
      [14, 9, 'email', 'Proposta enviada: 20 temporários + 5 efetivos.'],
      [6, 11, 'whatsapp', 'Contrato está no jurídico, previsão de 1 semana.'],
    ],
  },
  {
    nome: 'Autopeças Triângulo',
    segmento: 'Varejo',
    porte: 'Média',
    cidade: 'Uberaba',
    uf: 'MG',
    decisor: ['Rodrigo Teixeira', 'Gerente de Loja', '(34) 99318-6602', 'rodrigo@autopecastriangulo.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'fechado',
    diasNaEtapa: 3,
    resp: 'rosali',
    valor: 7500,
    prox: null,
    acao: 'Enviar os primeiros currículos',
    interacoes: [
      [16, 9, 'whatsapp', 'Primeiro contato. Precisam de 2 vendedores de balcão.', 'rosali'],
      [9, 15, 'reuniao', 'Conversa na loja.', 'rosali'],
      [3, 10, 'ligacao', 'Fechado! Vamos começar segunda.', 'rosali'],
    ],
  },
  {
    nome: 'Laboratório Diagnóstico Mineiro',
    segmento: 'Saúde',
    porte: 'Média',
    cidade: 'Juiz de Fora',
    uf: 'MG',
    decisor: ['Fernanda Lopes', 'Gerente Administrativa', '(32) 99145-7736', 'fernanda@labmineiro.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'primeiro_contato',
    diasNaEtapa: 6,
    resp: 'marlete',
    valor: 9000,
    prox: 2,
    acao: 'Mandar mensagem perguntando das vagas de coleta',
    interacoes: [[6, 10, 'ligacao', 'Falei com a secretária. Fernanda retorna na semana que vem.']],
  },
  {
    nome: 'Usinagem Precisão ABC',
    segmento: 'Indústria',
    porte: 'Média',
    cidade: 'São Bernardo do Campo',
    uf: 'SP',
    decisor: ['Antônio Carlos Gimenes', 'Gerente de Produção', '(11) 99702-3349', 'antonio@usinagemabc.exemplo'],
    servicos: ['recrutamento', 'treinamentos'],
    etapa: 'qualificacao',
    diasNaEtapa: 2,
    resp: 'rosali',
    valor: 13000,
    prox: 6,
    acao: 'Mandar exemplo de perfil de torneiro CNC',
    interacoes: [
      [8, 9, 'whatsapp', 'Primeira mensagem. Respondeu interessado.', 'rosali'],
      [2, 16, 'ligacao', 'Precisa de 3 torneiros CNC. Já tentou com outra agência e não deu certo.', 'rosali'],
    ],
  },
  {
    nome: 'Mercadão Popular Ribeirão',
    segmento: 'Varejo',
    porte: 'Grande',
    cidade: 'Ribeirão Preto',
    uf: 'SP',
    decisor: ['Tatiane Guimarães', 'Gerente de RH', '(16) 99281-4407', 'tatiane@mercadaopopular.exemplo'],
    servicos: ['temporaria'],
    etapa: 'nova',
    diasNaEtapa: 4,
    resp: 'marlete',
    valor: 15000,
    prox: 1,
    acao: 'Mandar a primeira mensagem',
    interacoes: [[4, 9, 'anotacao', 'Vi no LinkedIn que estão abrindo uma loja nova em dezembro.']],
  },
  {
    nome: 'Expresso Rodovias Sul',
    segmento: 'Logística',
    porte: 'Grande',
    cidade: 'Joinville',
    uf: 'SC',
    decisor: ['Paulo Roberto Klein', 'Diretor', '(47) 99510-6698', 'paulo.klein@expressosul.exemplo'],
    servicos: ['temporaria'],
    etapa: 'perdido',
    diasNaEtapa: 30,
    resp: 'marlete',
    valor: 20000,
    prox: null,
    acao: 'Escolheram outra empresa por preço',
    interacoes: [
      [45, 10, 'ligacao', 'Primeiro contato.'],
      [38, 14, 'email', 'Proposta enviada.'],
      [30, 11, 'ligacao', 'Fecharam com outra empresa por preço.'],
    ],
  },
  {
    nome: 'Incorporadora Pátio Brasília',
    segmento: 'Construção',
    porte: 'Grande',
    cidade: 'Brasília',
    uf: 'DF',
    decisor: ['Larissa Fontenelle', 'Gerente de Pessoas', '(61) 99832-0175', 'larissa@patiobrasilia.exemplo'],
    servicos: ['consultoria_cargos', 'consultoria_clima'],
    etapa: 'primeiro_contato',
    diasNaEtapa: 2,
    resp: 'rosali',
    valor: 19000,
    prox: 3,
    acao: 'Ligar para entender o plano de cargos',
    interacoes: [[2, 15, 'email', 'E-mail de apresentação das consultorias.', 'rosali']],
  },
  {
    nome: 'Padaria e Confeitaria Trigo de Ouro',
    segmento: 'Alimentação',
    porte: 'Pequena',
    cidade: 'Londrina',
    uf: 'PR',
    decisor: ['Sérgio Tanaka', 'Proprietário', '(43) 99107-3328', 'sergio@trigodeouro.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'fechado',
    diasNaEtapa: 12,
    resp: 'marlete',
    valor: 4500,
    prox: null,
    acao: 'Ligar para saber se o confeiteiro se adaptou',
    interacoes: [
      [20, 10, 'whatsapp', 'Primeiro contato. Precisa de um confeiteiro.'],
      [12, 14, 'ligacao', 'Fechado.'],
    ],
  },
  {
    nome: 'DataFlux Tecnologia',
    segmento: 'Tecnologia',
    porte: 'Pequena',
    cidade: 'Florianópolis',
    uf: 'SC',
    site: 'dataflux.tech',
    decisor: ['Camila Westphal', 'Head de Pessoas', '(48) 99645-2219', 'camila@dataflux.exemplo', 'linkedin.com/in/camilawestphal'],
    servicos: ['recrutamento', 'consultoria_clima'],
    etapa: 'apresentacao',
    diasNaEtapa: 8,
    resp: 'marlete',
    valor: 11000,
    prox: 4,
    acao: 'Mandar o material de pesquisa de clima',
    interacoes: [
      [14, 10, 'email', 'Contato pelo LinkedIn.'],
      [8, 16, 'reuniao', 'Apresentação por vídeo. Ficaram de levar para os sócios.'],
    ],
  },
  {
    nome: 'Hortifruti Chapada',
    segmento: 'Varejo',
    porte: 'Média',
    cidade: 'Vitória da Conquista',
    uf: 'BA',
    decisor: ['Edmilson Souza', 'Gerente Geral', '(77) 99203-5586', 'edmilson@hortichapada.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'nova',
    diasNaEtapa: 6,
    resp: 'rosali',
    valor: 6000,
    prox: 2,
    acao: 'Mandar a primeira mensagem',
    interacoes: [],
  },
  {
    nome: 'Clínica Odonto Sorriso Goiano',
    segmento: 'Saúde',
    porte: 'Pequena',
    cidade: 'Aparecida de Goiânia',
    uf: 'GO',
    decisor: ['Priscila Amaral', 'Sócia', '(62) 99178-6620', 'priscila@sorrisogoiano.exemplo'],
    servicos: ['recrutamento'],
    etapa: 'qualificacao',
    diasNaEtapa: 1,
    resp: 'marlete',
    valor: 5000,
    prox: 5,
    acao: 'Perguntar o perfil da recepcionista',
    interacoes: [
      [4, 9, 'whatsapp', 'Primeiro contato pelo WhatsApp.'],
      [1, 17, 'whatsapp', 'Precisa de recepcionista e auxiliar de saúde bucal.'],
    ],
  },
  {
    nome: 'Embalagens Paulistânia',
    segmento: 'Indústria',
    porte: 'Grande',
    cidade: 'Sorocaba',
    uf: 'SP',
    site: 'paulistania.ind.br',
    decisor: ['Vanessa Cardoso', 'Coordenadora de RH', '(15) 99356-8014', 'vanessa@paulistania.exemplo'],
    servicos: ['temporaria', 'recrutamento'],
    etapa: 'nova',
    diasNaEtapa: 3,
    resp: 'marlete',
    valor: 17000,
    prox: 7,
    acao: 'Mandar a primeira mensagem',
    interacoes: [],
  },
  {
    nome: 'Rio Sul Engenharia Elétrica',
    segmento: 'Construção',
    porte: 'Média',
    cidade: 'Volta Redonda',
    uf: 'RJ',
    decisor: ['Leandro Faria', 'Gerente de Obras', '(24) 99251-4473', 'leandro@riosuleng.exemplo'],
    servicos: ['recrutamento', 'treinamentos'],
    etapa: 'negociacao',
    diasNaEtapa: 6,
    resp: 'rosali',
    valor: 21000,
    prox: 2,
    acao: 'Ajustar a proposta com 2 eletricistas a mais',
    interacoes: [
      [21, 10, 'ligacao', 'Primeiro contato.', 'rosali'],
      [14, 15, 'reuniao', 'Apresentação por vídeo.', 'rosali'],
      [6, 9, 'email', 'Proposta enviada: 6 eletricistas + NR-10.', 'rosali'],
      [1, 16, 'ligacao', 'Pediu para incluir mais 2 eletricistas.', 'rosali'],
    ],
  },
]

/** Empresas que o Rafael encontrou na última busca e ainda estão só na base. */
const BASE_RAFAEL: Array<[nome: string, segmento: Segmento, porte: Porte, cidade: string, uf: UF, decisor: string, cargo: string, tel: string, status: 'fila' | 'contatada']> = [
  ['Fundição Vale do Aço', 'Indústria', 'Grande', 'Ipatinga', 'MG', 'Rogério Martins', 'Gerente de RH', '(31) 99724-1150', 'fila'],
  ['Atacadão Mineiro Distribuição', 'Varejo', 'Grande', 'Montes Claros', 'MG', 'Simone Barcelos', 'Coordenadora de RH', '(38) 99812-0034', 'fila'],
  ['Policlínica Santa Clara', 'Saúde', 'Média', 'Divinópolis', 'MG', 'Dr. Augusto Lemos', 'Diretor Clínico', '(37) 99206-7781', 'contatada'],
  ['Cargo Rápido Transportes', 'Logística', 'Média', 'Betim', 'MG', 'Elaine Rezende', 'Supervisora Administrativa', '(31) 99145-3092', 'fila'],
  ['Granja Bom Ninho', 'Alimentação', 'Média', 'Bastos', 'SP', 'Hiroshi Nakamura', 'Proprietário', '(14) 99638-2217', 'fila'],
  ['Tecnoaço Estruturas Metálicas', 'Indústria', 'Média', 'Jundiaí', 'SP', 'Carla Bertolini', 'Gerente Administrativa', '(11) 99521-6640', 'contatada'],
  ['Farmácias Vida Paulista', 'Varejo', 'Grande', 'Bauru', 'SP', 'Marcelo Antunes', 'Gerente Regional', '(14) 99407-5528', 'fila'],
  ['Logística Anhanguera', 'Logística', 'Grande', 'Senador Canedo', 'GO', 'Gilberto Assis', 'Gerente de Operações', '(62) 99310-4486', 'fila'],
  ['Construtora Buriti', 'Construção', 'Média', 'Itumbiara', 'GO', 'Rafaela Moura', 'Engenheira de Obras', '(64) 99215-8873', 'fila'],
  ['Biscoitos Pinhão Doce', 'Alimentação', 'Média', 'Guarapuava', 'PR', 'Adriana Krüger', 'Coordenadora de RH', '(42) 99129-3365', 'contatada'],
  ['Software Araucária', 'Tecnologia', 'Pequena', 'Maringá', 'PR', 'Thiago Brandalise', 'CTO', '(44) 99830-2251', 'fila'],
  ['Hospital Litoral Norte', 'Saúde', 'Grande', 'Caraguatatuba', 'SP', 'Márcia Valente', 'Gerente de Pessoas', '(12) 99714-0029', 'fila'],
  ['Pré-Moldados Recôncavo', 'Construção', 'Média', 'Camaçari', 'BA', 'Antônio Sales', 'Diretor', '(71) 99633-1907', 'fila'],
  ['Supermercado Chapadão', 'Varejo', 'Média', 'Barreiras', 'BA', 'Júlia Carvalho', 'Gerente de Loja', '(77) 99145-6624', 'fila'],
  ['Malharia Pomerode', 'Indústria', 'Média', 'Pomerode', 'SC', 'Ingrid Zimmer', 'Gerente de RH', '(47) 99280-7713', 'contatada'],
  ['Laboratório Capital Saúde', 'Saúde', 'Média', 'Taguatinga', 'DF', 'Roberta Viana', 'Coordenadora Administrativa', '(61) 99503-8842', 'fila'],
  ['Transportadora Guanabara Cargas', 'Logística', 'Grande', 'Duque de Caxias', 'RJ', 'Fábio Rangel', 'Gerente de Frota', '(21) 99208-3316', 'fila'],
  ['Cozinha Industrial Sabor de Casa', 'Alimentação', 'Média', 'Nova Iguaçu', 'RJ', 'Denise Prates', 'Sócia-administradora', '(21) 99734-6658', 'fila'],
]

function emHora(diasAtras: number, hora: number, base: Date) {
  return setMinutes(setHours(subDays(startOfDay(base), diasAtras), hora), (diasAtras * 17) % 60).toISOString()
}

function slug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export interface DadosIniciais {
  empresas: Empresa[]
  interacoes: Interacao[]
  assistentes: Assistente[]
  configuracoes: Configuracoes
}

export function gerarDadosIniciais(base = new Date()): DadosIniciais {
  const empresas: Empresa[] = []
  const interacoes: Interacao[] = []

  FUNIL.forEach((e, i) => {
    const id = `emp_${slug(e.nome)}`
    const [nome, cargo, telefone, email, linkedin] = e.decisor
    const criadaDiasAtras = Math.max(e.diasNaEtapa, ...e.interacoes.map((x) => x[0]), 1) + 2
    empresas.push({
      id,
      nome: e.nome,
      cnpj: e.cnpj,
      segmento: e.segmento,
      porte: e.porte,
      cidade: e.cidade,
      uf: e.uf,
      site: e.site,
      decisor: { nome, cargo, telefone, email, linkedin },
      servicos: e.servicos,
      status: 'funil',
      etapaId: e.etapa,
      etapaDesde: emHora(e.diasNaEtapa, 9, base),
      responsavelId: e.resp,
      valorEstimado: e.valor,
      proximoContato: e.prox === null ? null : diaISO(addDays(base, e.prox)),
      proximaAcao: e.acao,
      origem: i % 4 === 0 ? 'manual' : 'rafael',
      criadaEm: emHora(criadaDiasAtras, 8, base),
    })
    e.interacoes.forEach(([diasAtras, hora, tipo, texto, autora], j) => {
      interacoes.push({
        id: `int_${slug(e.nome)}_${j}`,
        empresaId: id,
        tipo,
        data: emHora(diasAtras, hora, base),
        texto,
        autoraId: autora ?? e.resp,
      })
    })
  })

  // Última busca do Rafael: a segunda-feira mais recente (ou hoje, se for segunda).
  const segunda = inicioDaSemana(base)
  BASE_RAFAEL.forEach(([nome, segmento, porte, cidade, uf, decisor, cargo, telefone, status], i) => {
    const id = `emp_${slug(nome)}`
    empresas.push({
      id,
      nome,
      segmento,
      porte,
      cidade,
      uf,
      decisor: { nome: decisor, cargo, telefone },
      servicos: [i % 3 === 0 ? 'temporaria' : 'recrutamento'],
      status,
      etapaId: null,
      etapaDesde: null,
      responsavelId: i % 2 === 0 ? 'rosali' : 'marlete',
      valorEstimado: 0,
      proximoContato: null,
      proximaAcao: status === 'contatada' ? 'Esperar resposta da Lívia' : 'Primeira mensagem pela Lívia',
      origem: 'rafael',
      criadaEm: setHours(segunda, 7).toISOString(),
    })
    if (status === 'contatada') {
      interacoes.push({
        id: `int_${slug(nome)}_0`,
        empresaId: id,
        tipo: 'whatsapp',
        data: setHours(addDays(segunda, 1), 9).toISOString(),
        texto: 'Primeira mensagem enviada pela Lívia.',
        autoraId: i % 2 === 0 ? 'rosali' : 'marlete',
      })
    }
  })

  const assistentes: Assistente[] = [
    {
      id: 'livia',
      nome: 'Lívia',
      funcao: 'Primeiro contato',
      ativo: true,
      config: {
        horario: '09:00',
        quantidadePorDia: 20,
        dias: [1, 2, 3, 4, 5],
        modelo: MODELOS[0].texto,
      },
      historico: [1, 2, 3, 4, 7, 8].map((diasAtras, i) => ({
        id: `disp_${i}`,
        data: emHora(diasAtras, 9, base),
        enviadas: [20, 20, 18, 20, 20, 15][i],
        respostas: [5, 3, 4, 6, 2, 3][i],
      })),
    },
    {
      id: 'rafael',
      nome: 'Rafael',
      funcao: 'Busca de empresas',
      ativo: true,
      config: {
        diaSemana: 1,
        estados: ['MG', 'SP', 'GO', 'PR'],
        cidades: [],
        segmentos: ['Indústria', 'Saúde', 'Logística', 'Alimentação'],
        quantidadePorSemana: 50,
      },
      historico: [0, 7, 14, 21].map((diasAtras, i) => ({
        id: `busca_${i}`,
        data: setHours(subDays(segunda, diasAtras), 7).toISOString(),
        encontradas: [BASE_RAFAEL.length, 42, 50, 37][i],
        estados: ['MG', 'SP', 'GO', 'PR'],
      })),
    },
  ]

  return { empresas, interacoes, assistentes, configuracoes: structuredClone(CONFIGURACOES) }
}
