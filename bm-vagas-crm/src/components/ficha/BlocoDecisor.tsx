import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Mail, Pencil, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/Campo'
import { LinkedInIcon, WhatsAppIcon } from '@/components/common/IconesMarca'
import { Bloco } from './Bloco'
import { useCrm } from '@/store/CrmProvider'
import { formatarTelefone, iniciais } from '@/lib/formatar'
import { linkWhatsApp, preencherModelo } from '@/lib/mensagens'
import { modeloDaEtapa } from '@/lib/selecoes'
import { soDigitos } from '@/lib/utils'
import type { Contato, Empresa } from '@/types'

export function BlocoDecisor({ empresa }: { empresa: Empresa }) {
  const { atualizarEmpresa, config, usuariaAtual } = useCrm()
  const [editando, setEditando] = useState(false)
  const [d, setD] = useState<Contato>(empresa.decisor)
  useEffect(() => setD(empresa.decisor), [empresa.decisor])

  const p = empresa.decisor
  const tel = soDigitos(p.telefone)
  const mensagem = preencherModelo(modeloDaEtapa(config, empresa.etapaId).texto, empresa, usuariaAtual)
  const linkedin = p.linkedin ? (p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`) : null

  async function salvar() {
    await atualizarEmpresa(empresa.id, { decisor: { ...d, nome: d.nome.trim() || p.nome } })
    setEditando(false)
    toast.success('Dados do decisor salvos')
  }

  return (
    <Bloco
      titulo="Decisor"
      acao={
        !editando && (
          <Button variant="ghost" size="sm" onClick={() => setEditando(true)}>
            <Pencil className="size-4" /> Editar
          </Button>
        )
      }
    >
      {editando ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id="dec-nome" label="Nome">
            <Input id="dec-nome" value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} />
          </Campo>
          <Campo id="dec-cargo" label="Cargo">
            <Input id="dec-cargo" value={d.cargo} onChange={(e) => setD({ ...d, cargo: e.target.value })} />
          </Campo>
          <Campo id="dec-tel" label="Telefone / WhatsApp">
            <Input id="dec-tel" type="tel" value={d.telefone} onChange={(e) => setD({ ...d, telefone: e.target.value })} />
          </Campo>
          <Campo id="dec-email" label="E-mail">
            <Input id="dec-email" type="email" value={d.email ?? ''} onChange={(e) => setD({ ...d, email: e.target.value })} />
          </Campo>
          <Campo id="dec-li" label="LinkedIn" className="sm:col-span-2">
            <Input id="dec-li" value={d.linkedin ?? ''} onChange={(e) => setD({ ...d, linkedin: e.target.value })} placeholder="linkedin.com/in/..." />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="ghost" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar}>Salvar</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-3 font-display text-base font-bold text-ink-2 ring-1 ring-border">
              {iniciais(p.nome)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[17px] font-semibold text-foreground">{p.nome}</p>
              <p className="truncate text-sm text-muted-foreground">{p.cargo || 'Cargo não informado'}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            {p.telefone && (
              <div className="flex gap-2">
                <dt className="sr-only">Telefone</dt>
                <dd className="text-ink-2 tabular">{formatarTelefone(p.telefone)}</dd>
              </div>
            )}
            {p.email && (
              <div className="flex gap-2">
                <dt className="sr-only">E-mail</dt>
                <dd className="truncate text-ink-2">{p.email}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="secondary" asChild disabled={!tel}>
              <a href={tel ? `tel:+55${tel}` : undefined} aria-disabled={!tel}>
                <Phone /> Ligar
              </a>
            </Button>
            <Button variant="whatsapp" asChild>
              <a href={tel ? linkWhatsApp(p.telefone, mensagem) : undefined} target="_blank" rel="noreferrer" aria-disabled={!tel}>
                <WhatsAppIcon /> WhatsApp
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href={p.email ? `mailto:${p.email}` : undefined} aria-disabled={!p.email} className={!p.email ? 'pointer-events-none opacity-40' : ''}>
                <Mail /> E-mail
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a
                href={linkedin ?? undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!linkedin}
                className={!linkedin ? 'pointer-events-none opacity-40' : ''}
              >
                <LinkedInIcon /> LinkedIn
              </a>
            </Button>
          </div>
        </>
      )}
    </Bloco>
  )
}
