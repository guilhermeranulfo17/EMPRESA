import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Campo } from '@/components/common/Campo'
import { Bloco, Dado } from './Bloco'
import { useCrm } from '@/store/CrmProvider'
import { PORTES, SEGMENTOS, UFS } from '@/lib/constantes'
import { formatarCnpj } from '@/lib/formatar'
import type { Empresa, Porte, Segmento, UF } from '@/types'

type Rascunho = Pick<Empresa, 'nome' | 'cnpj' | 'segmento' | 'porte' | 'cidade' | 'uf' | 'site'>

export function BlocoDados({ empresa }: { empresa: Empresa }) {
  const { atualizarEmpresa } = useCrm()
  const [editando, setEditando] = useState(false)
  const inicial = (): Rascunho => ({
    nome: empresa.nome,
    cnpj: empresa.cnpj,
    segmento: empresa.segmento,
    porte: empresa.porte,
    cidade: empresa.cidade,
    uf: empresa.uf,
    site: empresa.site,
  })
  const [r, setR] = useState<Rascunho>(inicial)
  useEffect(() => setR(inicial()), [empresa]) // eslint-disable-line react-hooks/exhaustive-deps

  async function salvar() {
    await atualizarEmpresa(empresa.id, { ...r, nome: r.nome.trim() || empresa.nome })
    setEditando(false)
    toast.success('Dados da empresa salvos')
  }

  const site = empresa.site ? (empresa.site.startsWith('http') ? empresa.site : `https://${empresa.site}`) : null

  return (
    <Bloco
      titulo="Dados da empresa"
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
          <Campo id="emp-nome" label="Nome" className="sm:col-span-2">
            <Input id="emp-nome" value={r.nome} onChange={(e) => setR({ ...r, nome: e.target.value })} />
          </Campo>
          <Campo id="emp-cnpj" label="CNPJ (opcional)">
            <Input id="emp-cnpj" inputMode="numeric" value={r.cnpj ?? ''} onChange={(e) => setR({ ...r, cnpj: e.target.value })} />
          </Campo>
          <Campo id="emp-site" label="Site">
            <Input id="emp-site" value={r.site ?? ''} onChange={(e) => setR({ ...r, site: e.target.value })} placeholder="empresa.com.br" />
          </Campo>
          <Campo id="emp-seg" label="Segmento">
            <Select value={r.segmento} onValueChange={(v) => setR({ ...r, segmento: v as Segmento })}>
              <SelectTrigger id="emp-seg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEGMENTOS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo id="emp-porte" label="Porte">
            <Select value={r.porte} onValueChange={(v) => setR({ ...r, porte: v as Porte })}>
              <SelectTrigger id="emp-porte">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORTES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo id="emp-cidade" label="Cidade">
            <Input id="emp-cidade" value={r.cidade} onChange={(e) => setR({ ...r, cidade: e.target.value })} />
          </Campo>
          <Campo id="emp-uf" label="Estado">
            <Select value={r.uf} onValueChange={(v) => setR({ ...r, uf: v as UF })}>
              <SelectTrigger id="emp-uf">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UFS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="ghost" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar}>Salvar</Button>
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <Dado rotulo="CNPJ">{empresa.cnpj ? formatarCnpj(empresa.cnpj) : ''}</Dado>
          <Dado rotulo="Segmento">{empresa.segmento}</Dado>
          <Dado rotulo="Porte">{empresa.porte}</Dado>
          <Dado rotulo="Cidade">
            {empresa.cidade}/{empresa.uf}
          </Dado>
          <div className="col-span-2">
            <Dado rotulo="Site">
              {site && (
                <a href={site} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#FF8A4C] hover:underline">
                  {empresa.site}
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </Dado>
          </div>
        </dl>
      )}
    </Bloco>
  )
}
