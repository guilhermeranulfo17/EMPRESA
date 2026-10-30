import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { Bloco } from './Bloco'
import { useCrm } from '@/store/CrmProvider'
import { COR_SERVICO, SERVICOS } from '@/lib/constantes'
import { cn } from '@/lib/utils'
import type { Empresa, ServicoId } from '@/types'

const GRUPOS = ['Recrutamento e Seleção', 'Mão de Obra Temporária', 'Consultorias', 'Treinamentos e Palestras'] as const

export function BlocoServicos({ empresa }: { empresa: Empresa }) {
  const { atualizarEmpresa } = useCrm()

  async function alternar(id: ServicoId) {
    const tem = empresa.servicos.includes(id)
    const servicos = tem ? empresa.servicos.filter((s) => s !== id) : [...empresa.servicos, id]
    await atualizarEmpresa(empresa.id, { servicos })
    toast.success(tem ? 'Serviço removido' : 'Serviço adicionado')
  }

  return (
    <Bloco titulo="Serviço de interesse">
      <div className="flex flex-col gap-3">
        {GRUPOS.map((grupo) => {
          const itens = SERVICOS.filter((s) => s.grupo === grupo)
          return (
            <div key={grupo}>
              {itens.length > 1 && <p className="mb-1.5 text-xs font-medium text-muted-foreground">{grupo}</p>}
              <div className="flex flex-wrap gap-2">
                {itens.map((s) => {
                  const ativo = empresa.servicos.includes(s.id)
                  const cor = COR_SERVICO[s.id]
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => alternar(s.id)}
                      className={cn(
                        'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-all',
                        !ativo && 'border-border bg-transparent text-muted-foreground hover:border-border-strong hover:text-foreground',
                      )}
                      style={ativo ? { color: cor.texto, backgroundColor: cor.fundo, borderColor: cor.borda } : undefined}
                    >
                      {ativo && <Check className="size-4" strokeWidth={2.5} />}
                      {s.nome}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Bloco>
  )
}
