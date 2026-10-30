import type { Empresa, Usuaria } from '@/types'
import { primeiroNome } from './formatar'

/** Variáveis aceitas nos modelos de mensagem. */
export const VARIAVEIS = ['{nome}', '{empresa}', '{cidade}', '{meu_nome}'] as const

export function preencherModelo(modelo: string, empresa: Pick<Empresa, 'nome' | 'cidade' | 'decisor'>, autora?: Usuaria) {
  return modelo
    .replaceAll('{nome}', primeiroNome(empresa.decisor.nome))
    .replaceAll('{empresa}', empresa.nome)
    .replaceAll('{cidade}', empresa.cidade)
    .replaceAll('{meu_nome}', autora ? autora.nome : 'equipe BM Vagas')
}

/** Link do WhatsApp com a mensagem já escrita. */
export function linkWhatsApp(telefone: string, mensagem?: string) {
  let numero = telefone.replace(/\D/g, '')
  if (numero.length <= 11) numero = `55${numero}`
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''
  return `https://wa.me/${numero}${texto}`
}

export async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // Navegadores antigos ou página sem permissão: usa o jeito clássico.
    const area = document.createElement('textarea')
    area.value = texto
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}
