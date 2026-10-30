/*
 * Ponto único de acesso aos dados. Para plugar o Supabase:
 *   1. crie services/supabase/*.ts implementando os contratos de ./contratos
 *   2. troque as importações abaixo
 * Nenhuma tela precisa mudar.
 */
import { empresasLocal } from './local/empresas'
import { interacoesLocal } from './local/interacoes'
import { assistentesLocal, configuracoesLocal, dadosLocal, rotinaLocal, sessaoLocal } from './local/outros'

export const api = {
  dados: dadosLocal,
  empresas: empresasLocal,
  interacoes: interacoesLocal,
  assistentes: assistentesLocal,
  configuracoes: configuracoesLocal,
  rotina: rotinaLocal,
  sessao: sessaoLocal,
}

export type * from './contratos'
