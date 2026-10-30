const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const compacto = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })

export function formatarMoeda(valor: number) {
  return moeda.format(valor || 0)
}

/** "R$ 12,5 mil" para caber no cabeçalho das colunas. */
export function formatarMoedaCurta(valor: number) {
  if (!valor) return 'R$ 0'
  if (valor < 1000) return moeda.format(valor)
  return `R$ ${compacto.format(valor)}`
}

export function formatarTelefone(tel: string) {
  const d = tel.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return tel
}

export function formatarCnpj(cnpj: string) {
  const d = cnpj.replace(/\D/g, '')
  if (d.length !== 14) return cnpj
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? nome
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '')).toUpperCase()
}

export function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`
}
