import type { EmpresasService, LinhaImportacao } from '../contratos'
import { tabela } from './base'
import { SEGMENTOS, UFS } from '@/lib/constantes'
import { hojeISO } from '@/lib/datas'
import { normalizar, soDigitos, uid } from '@/lib/utils'
import type { Empresa, Segmento, UF } from '@/types'

function alterar(id: string, mudar: (e: Empresa) => Empresa) {
  const lista = tabela.empresas()
  const i = lista.findIndex((e) => e.id === id)
  if (i < 0) throw new Error('Empresa não encontrada')
  lista[i] = mudar(lista[i])
  tabela.salvarEmpresas(lista)
  return lista[i]
}

function chaveNome(nome: string, uf?: string) {
  const limpo = normalizar(nome)
    .replace(/\b(ltda|me|epp|eireli|s\/?a|sa)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
  return `${limpo}|${(uf ?? '').toUpperCase()}`
}

function adivinharSegmento(texto?: string): Segmento {
  if (!texto) return 'Indústria'
  const t = normalizar(texto)
  return SEGMENTOS.find((s) => t.includes(normalizar(s).slice(0, 5))) ?? 'Indústria'
}

export const empresasLocal: EmpresasService = {
  async listar() {
    return tabela.empresas()
  },

  async criar(dados) {
    const agora = new Date().toISOString()
    const empresa: Empresa = {
      ...dados,
      id: uid('emp'),
      criadaEm: agora,
      etapaDesde: dados.etapaId ? (dados.etapaDesde ?? agora) : null,
    }
    tabela.salvarEmpresas([empresa, ...tabela.empresas()])
    return empresa
  },

  async atualizar(id, alteracoes) {
    return alterar(id, (e) => {
      const etapaMudou = alteracoes.etapaId !== undefined && alteracoes.etapaId !== e.etapaId
      return {
        ...e,
        ...alteracoes,
        id: e.id,
        etapaDesde: etapaMudou ? new Date().toISOString() : (alteracoes.etapaDesde ?? e.etapaDesde),
      }
    })
  },

  async moverEtapa(id, etapaId) {
    return alterar(id, (e) => {
      if (e.etapaId === etapaId) return e
      const encerrada = etapaId === 'fechado' || etapaId === 'perdido'
      return {
        ...e,
        etapaId,
        status: 'funil',
        etapaDesde: new Date().toISOString(),
        proximoContato: encerrada ? null : (e.proximoContato ?? hojeISO()),
      }
    })
  },

  async reagendar(id, dia) {
    return alterar(id, (e) => ({ ...e, proximoContato: dia }))
  },

  async mudarStatus(ids, status, responsavelId) {
    const alvo = new Set(ids)
    const agora = new Date().toISOString()
    const lista = tabela.empresas().map((e) => {
      if (!alvo.has(e.id)) return e
      if (status === 'funil') {
        if (e.status === 'funil') return e
        return {
          ...e,
          status,
          etapaId: e.status === 'contatada' ? ('primeiro_contato' as const) : ('nova' as const),
          etapaDesde: agora,
          responsavelId: e.responsavelId ?? responsavelId,
          proximoContato: e.proximoContato ?? hojeISO(),
          proximaAcao: e.status === 'contatada' ? 'Ver se respondeu a mensagem da Lívia' : 'Mandar a primeira mensagem',
        }
      }
      return { ...e, status, etapaId: null, etapaDesde: null, proximoContato: null }
    })
    tabela.salvarEmpresas(lista)
    return lista.filter((e) => alvo.has(e.id))
  },

  async importar(linhas: LinhaImportacao[], responsavelId, status) {
    const existentes = tabela.empresas()
    const cnpjs = new Set(existentes.map((e) => soDigitos(e.cnpj ?? '')).filter((c) => c.length === 14))
    const nomes = new Set(existentes.map((e) => chaveNome(e.nome, e.uf)))
    const telefones = new Set(existentes.map((e) => soDigitos(e.decisor.telefone)).filter((t) => t.length >= 10))

    const novas: Empresa[] = []
    let duplicadas = 0
    let invalidas = 0
    const agora = new Date().toISOString()

    for (const linha of linhas) {
      const nome = linha.nome?.trim()
      if (!nome) {
        invalidas++
        continue
      }
      const uf = (UFS as string[]).includes((linha.uf ?? '').trim().toUpperCase())
        ? ((linha.uf ?? '').trim().toUpperCase() as UF)
        : 'MG'
      const cnpj = soDigitos(linha.cnpj ?? '')
      const tel = soDigitos(linha.telefone ?? '')
      const chave = chaveNome(nome, uf)
      const repetida =
        nomes.has(chave) || (cnpj.length === 14 && cnpjs.has(cnpj)) || (tel.length >= 10 && telefones.has(tel))
      if (repetida) {
        duplicadas++
        continue
      }
      nomes.add(chave)
      if (cnpj.length === 14) cnpjs.add(cnpj)
      if (tel.length >= 10) telefones.add(tel)

      novas.push({
        id: uid('emp'),
        nome,
        cnpj: cnpj || undefined,
        segmento: adivinharSegmento(linha.segmento),
        porte: 'Média',
        cidade: linha.cidade?.trim() || 'Não informada',
        uf,
        site: linha.site?.trim() || undefined,
        decisor: {
          nome: linha.decisor?.trim() || 'Responsável não informado',
          cargo: linha.cargo?.trim() || '',
          telefone: linha.telefone?.trim() || '',
          email: linha.email?.trim() || undefined,
        },
        servicos: ['recrutamento'],
        status,
        etapaId: status === 'funil' ? 'nova' : null,
        etapaDesde: status === 'funil' ? agora : null,
        responsavelId,
        valorEstimado: 0,
        proximoContato: status === 'funil' ? hojeISO() : null,
        proximaAcao: 'Mandar a primeira mensagem',
        origem: 'importacao',
        criadaEm: agora,
      })
    }

    tabela.salvarEmpresas([...novas, ...existentes])
    return { importadas: novas.length, duplicadas, invalidas, empresas: novas }
  },
}
