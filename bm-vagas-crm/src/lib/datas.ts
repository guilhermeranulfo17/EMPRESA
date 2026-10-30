import {
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isSameMonth,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** Dia de hoje no formato yyyy-MM-dd (horário local). */
export function hojeISO(base = new Date()) {
  return format(base, 'yyyy-MM-dd')
}

export function diaISO(data: Date) {
  return format(data, 'yyyy-MM-dd')
}

export function somarDias(dias: number, base = new Date()) {
  return diaISO(addDays(base, dias))
}

/** Converte yyyy-MM-dd em Date no horário local (sem pular de dia por fuso). */
export function deDiaISO(dia: string) {
  return parseISO(dia.length === 10 ? `${dia}T12:00:00` : dia)
}

/** Quantos dias faltam (positivo) ou passaram (negativo) até o dia informado. */
export function diasAte(dia: string, base = new Date()) {
  return differenceInCalendarDays(deDiaISO(dia), base)
}

export function diasDesde(iso: string, base = new Date()) {
  return Math.max(0, differenceInCalendarDays(base, parseISO(iso)))
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** "Quinta, 29 de outubro" */
export function dataPorExtenso(data = new Date()) {
  const dia = format(data, 'EEEE', { locale: ptBR }).replace('-feira', '')
  return `${capitalizar(dia)}, ${format(data, "d 'de' MMMM", { locale: ptBR })}`
}

export function saudacao(data = new Date()) {
  const h = data.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** "há 3 dias", "hoje", "ontem" */
export function tempoRelativo(iso: string, base = new Date()) {
  const d = parseISO(iso)
  const dias = differenceInCalendarDays(base, d)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias > 1 && dias < 60) return `há ${dias} dias`
  return formatDistanceToNowStrict(d, { locale: ptBR, addSuffix: true })
}

/** Texto curto para o próximo contato: "Hoje", "Amanhã", "Atrasado há 2 dias", "Seg, 02/11". */
export function textoProximoContato(dia: string, base = new Date()) {
  const n = diasAte(dia, base)
  if (n === 0) return 'Hoje'
  if (n === 1) return 'Amanhã'
  if (n === -1) return 'Atrasado desde ontem'
  if (n < -1) return `Atrasado há ${-n} dias`
  if (n < 7) return capitalizar(format(deDiaISO(dia), 'EEEE', { locale: ptBR }).replace('-feira', ''))
  return format(deDiaISO(dia), "d 'de' MMM", { locale: ptBR })
}

export function dataCurta(iso: string) {
  return format(parseISO(iso), 'dd/MM', { locale: ptBR })
}

export function dataHora(iso: string) {
  return format(parseISO(iso), "d 'de' MMM 'às' HH:mm", { locale: ptBR })
}

/** "Segunda, 26/10" */
export function diaSemanaEData(iso: string) {
  const d = parseISO(iso)
  const dia = format(d, 'EEEE', { locale: ptBR }).replace('-feira', '')
  return `${capitalizar(dia)}, ${format(d, 'dd/MM')}`
}

export function inicioDaSemana(base = new Date()) {
  return startOfWeek(base, { weekStartsOn: 1 })
}

export function mesmoMes(iso: string, base = new Date()) {
  return isSameMonth(parseISO(iso), base)
}

/** Frase do toast: "Próximo contato amanhã", "em 3 dias", "em 1 semana", "em 12/11". */
export function fraseProximoContato(dia: string, base = new Date()) {
  const n = diasAte(dia, base)
  if (n <= 0) return 'Próximo contato hoje'
  if (n === 1) return 'Próximo contato amanhã'
  if (n === 7) return 'Próximo contato em 1 semana'
  if (n < 7) return `Próximo contato em ${n} dias`
  return `Próximo contato em ${format(deDiaISO(dia), 'dd/MM')}`
}
