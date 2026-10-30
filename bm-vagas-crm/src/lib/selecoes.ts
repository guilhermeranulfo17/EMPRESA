import { addDays, parseISO } from 'date-fns'
import { ETAPAS_ATIVAS } from './constantes'
import { diasAte, hojeISO, inicioDaSemana, mesmoMes } from './datas'
import type { Configuracoes, Empresa, EtapaId, Interacao } from '@/types'

/** Interações agrupadas por empresa, da mais recente para a mais antiga. */
export function interacoesPorEmpresa(interacoes: Interacao[]) {
  const mapa = new Map<string, Interacao[]>()
  for (const i of interacoes) {
    const lista = mapa.get(i.empresaId)
    if (lista) lista.push(i)
    else mapa.set(i.empresaId, [i])
  }
  for (const lista of mapa.values()) lista.sort((a, b) => b.data.localeCompare(a.data))
  return mapa
}

export function ultimoContato(lista: Interacao[] | undefined) {
  return lista?.find((i) => i.tipo !== 'anotacao')
}

/** Contatos de hoje: atrasados primeiro (mais antigos no topo), depois os de hoje. */
export function contatosDoDia(empresas: Empresa[], hoje = hojeISO()) {
  return empresas
    .filter(
      (e) =>
        e.status !== 'fila' &&
        e.proximoContato &&
        e.proximoContato <= hoje &&
        (e.etapaId === null || ETAPAS_ATIVAS.includes(e.etapaId)),
    )
    .sort((a, b) => {
      const d = (a.proximoContato ?? '').localeCompare(b.proximoContato ?? '')
      if (d !== 0) return d
      // Mesmo dia: quem está mais adiantado no funil vem antes.
      const ordem = (id: EtapaId | null) => (id ? ETAPAS_ATIVAS.indexOf(id) : -1)
      return ordem(b.etapaId) - ordem(a.etapaId)
    })
}

export function estaAtrasado(e: Empresa) {
  return !!e.proximoContato && diasAte(e.proximoContato) < 0
}

export function indicadores(empresas: Empresa[], interacoes: Interacao[], base = new Date()) {
  const inicio = inicioDaSemana(base)
  const daSemana = interacoes.filter((i) => i.tipo !== 'anotacao' && parseISO(i.data) >= inicio)
  const porDia = Array.from({ length: 7 }, (_, n) => {
    const dia = addDays(inicio, n)
    const chave = dia.toDateString()
    return {
      dia: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][n],
      total: daSemana.filter((i) => parseISO(i.data).toDateString() === chave).length,
    }
  })
  // Reunião marcada = empresa na etapa Apresentação (a reunião é o próximo passo dela).
  const reunioes = empresas.filter((e) => e.etapaId === 'apresentacao').length
  const propostas = empresas.filter((e) => e.etapaId === 'negociacao')
  const fechados = empresas.filter((e) => e.etapaId === 'fechado' && e.etapaDesde && mesmoMes(e.etapaDesde, base))
  return {
    contatosSemana: daSemana.length,
    contatosPorDia: porDia,
    reunioes,
    propostas: propostas.length,
    valorPropostas: propostas.reduce((s, e) => s + e.valorEstimado, 0),
    fechadosMes: fechados.length,
    valorFechadoMes: fechados.reduce((s, e) => s + e.valorEstimado, 0),
  }
}

export function nomeEtapa(config: Configuracoes, id: EtapaId | null) {
  if (!id) return 'Fora do funil'
  return config.etapas.find((e) => e.id === id)?.nome ?? id
}

export function modeloDaEtapa(config: Configuracoes, id: EtapaId | null) {
  const etapa = config.etapas.find((e) => e.id === (id ?? 'nova'))
  return config.modelos.find((m) => m.id === etapa?.modeloId) ?? config.modelos[0]
}
