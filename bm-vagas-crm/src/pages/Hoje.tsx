import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pagina } from '@/components/common/Pagina'
import { EsqueletoHoje } from '@/components/common/Esqueletos'
import { CardContato } from '@/components/hoje/CardContato'
import { Indicadores } from '@/components/hoje/Indicadores'
import { RegistrarContatoDialog } from '@/components/hoje/RegistrarContatoDialog'
import { RotinaDoDia } from '@/components/hoje/RotinaDoDia'
import { TudoEmDia } from '@/components/hoje/TudoEmDia'
import { useCrm } from '@/store/CrmProvider'
import { dataPorExtenso, saudacao, somarDias } from '@/lib/datas'
import { contatosDoDia, estaAtrasado, indicadores, interacoesPorEmpresa, ultimoContato } from '@/lib/selecoes'
import type { Empresa } from '@/types'

export default function Hoje() {
  const { carregando, empresas, interacoes, usuariaAtual } = useCrm()
  const [feito, setFeito] = useState<Empresa | null>(null)

  const lista = useMemo(() => contatosDoDia(empresas), [empresas])
  const porEmpresa = useMemo(() => interacoesPorEmpresa(interacoes), [interacoes])
  const dados = useMemo(() => indicadores(empresas, interacoes), [empresas, interacoes])
  const atrasados = lista.filter(estaAtrasado).length
  const amanha = useMemo(() => {
    const dia = somarDias(1)
    return empresas.filter((e) => e.proximoContato === dia).length
  }, [empresas])

  if (carregando) {
    return (
      <Pagina>
        <EsqueletoHoje />
      </Pagina>
    )
  }

  return (
    <Pagina>
      <header>
        <p className="text-[15px] font-medium text-muted-foreground">
          {saudacao()}, {usuariaAtual.nome}. {dataPorExtenso()}
        </p>
        <h1 className="mt-2 font-display text-[30px] leading-[1.1] font-bold text-balance text-foreground sm:text-[40px]">
          {lista.length === 0 ? (
            'Nenhum contato pendente hoje'
          ) : (
            <>
              Hoje vocês têm <span className="text-primary">{lista.length}</span>{' '}
              {lista.length === 1 ? 'contato' : 'contatos'} para fazer
            </>
          )}
        </h1>
        {atrasados > 0 && (
          <p className="mt-2 text-[15px] text-muted-foreground">
            Comecem pelos <span className="font-semibold text-danger-ink">{atrasados} atrasados</span>, que estão no topo da lista.
          </p>
        )}
      </header>

      <div className="mt-7">
        <Indicadores dados={dados} />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Contatos de hoje" className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {lista.map((empresa) => (
              <CardContato
                key={empresa.id}
                empresa={empresa}
                ultimo={ultimoContato(porEmpresa.get(empresa.id))}
                onFeito={setFeito}
              />
            ))}
          </AnimatePresence>
          <AnimatePresence>{lista.length === 0 && <TudoEmDia proximos={amanha} />}</AnimatePresence>
        </section>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:sticky lg:top-8"
        >
          <RotinaDoDia />
        </motion.aside>
      </div>

      <RegistrarContatoDialog empresa={feito} aberto={!!feito} onOpenChange={(v) => !v && setFeito(null)} />
    </Pagina>
  )
}
