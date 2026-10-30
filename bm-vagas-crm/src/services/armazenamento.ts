/*
 * O ÚNICO lugar do sistema que mexe no localStorage.
 * Quando o Supabase entrar, os serviços deixam de usar este arquivo.
 */

const PREFIXO = 'bmvagas:v1:'

/** Atraso artificial só para o skeleton aparecer, como num banco de verdade. */
export const LATENCIA_MS = 450

export function esperar(ms = LATENCIA_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(PREFIXO + chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    return padrao
  }
}

export function gravar<T>(chave: string, valor: T) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor))
  } catch {
    // Navegador sem espaço ou em modo privado: segue só na memória.
  }
}

export function existe(chave: string) {
  try {
    return localStorage.getItem(PREFIXO + chave) !== null
  } catch {
    return false
  }
}

export function apagarTudo() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIXO))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    // nada a fazer
  }
}

export const CHAVES = {
  empresas: 'empresas',
  interacoes: 'interacoes',
  assistentes: 'assistentes',
  configuracoes: 'configuracoes',
  rotina: 'rotina',
  usuariaAtual: 'usuaria-atual',
} as const
