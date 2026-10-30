import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { AvatarUsuaria } from '@/components/common/AvatarUsuaria'
import { ServicoTag } from '@/components/common/ServicoTag'
import { DiasParado } from '@/components/common/DiasParado'
import { useCrm } from '@/store/CrmProvider'
import { useFicha } from '@/hooks/useFicha'
import { COR_ETAPA } from '@/lib/constantes'
import { textoProximoContato } from '@/lib/datas'
import { formatarMoeda } from '@/lib/formatar'
import { estaAtrasado, nomeEtapa } from '@/lib/selecoes'
import { cn } from '@/lib/utils'
import type { Empresa } from '@/types'

export function ListaFunil({ empresas }: { empresas: Empresa[] }) {
  const { config } = useCrm()
  const { abrir } = useFicha()
  const ordem = (e: Empresa) => config.etapas.findIndex((x) => x.id === e.etapaId)
  const lista = [...empresas].sort((a, b) => ordem(a) - ordem(b) || a.nome.localeCompare(b.nome))

  return (
    <div className="surface overflow-hidden">
      {/* Desktop: tabela */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-border text-[12px] tracking-wider text-muted-foreground uppercase">
            <th className="px-5 py-3.5 font-semibold">Empresa</th>
            <th className="px-3 py-3.5 font-semibold">Etapa</th>
            <th className="px-3 py-3.5 font-semibold">Serviço</th>
            <th className="px-3 py-3.5 text-right font-semibold">Valor</th>
            <th className="px-3 py-3.5 font-semibold">Parada há</th>
            <th className="px-3 py-3.5 font-semibold">Próximo contato</th>
            <th className="px-5 py-3.5 font-semibold">
              <span className="sr-only">Responsável</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {lista.map((e, i) => (
            <motion.tr
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              onClick={() => abrir(e.id)}
              onKeyDown={(ev) => ev.key === 'Enter' && abrir(e.id)}
              tabIndex={0}
              className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
            >
              <td className="px-5 py-3.5">
                <p className="font-semibold text-foreground">{e.nome}</p>
                <p className="text-[13px] text-muted-foreground">
                  {e.decisor.nome} · {e.cidade}/{e.uf}
                </p>
              </td>
              <td className="px-3 py-3.5">
                <span className="inline-flex items-center gap-2 text-ink-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: e.etapaId ? COR_ETAPA[e.etapaId] : '#555' }} />
                  {nomeEtapa(config, e.etapaId)}
                </span>
              </td>
              <td className="px-3 py-3.5">{e.servicos[0] && <ServicoTag id={e.servicos[0]} />}</td>
              <td className="px-3 py-3.5 text-right font-display font-semibold tabular">{formatarMoeda(e.valorEstimado)}</td>
              <td className="px-3 py-3.5">
                <DiasParado desde={e.etapaDesde} />
              </td>
              <td className={cn('px-3 py-3.5', estaAtrasado(e) ? 'font-semibold text-danger-ink' : 'text-muted-foreground')}>
                {e.proximoContato ? textoProximoContato(e.proximoContato) : '—'}
              </td>
              <td className="px-5 py-3.5">
                <AvatarUsuaria id={e.responsavelId} tamanho="sm" />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Celular: lista de linhas grandes */}
      <ul className="md:hidden">
        {lista.map((e) => (
          <li key={e.id} className="border-b border-border last:border-0">
            <button type="button" onClick={() => abrir(e.id)} className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-surface-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: e.etapaId ? COR_ETAPA[e.etapaId] : '#555' }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{e.nome}</span>
                <span className="block truncate text-[13px] text-muted-foreground">
                  {nomeEtapa(config, e.etapaId)} · {e.cidade}/{e.uf}
                </span>
              </span>
              <AvatarUsuaria id={e.responsavelId} tamanho="sm" comDica={false} />
              <ChevronRight className="size-4 text-subtle" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
