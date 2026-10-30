import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Campo } from '@/components/common/Campo'
import { useCrm } from '@/store/CrmProvider'
import { useUi } from '@/store/UiProvider'
import { useFicha } from '@/hooks/useFicha'
import { SEGMENTOS, SERVICOS, UFS } from '@/lib/constantes'
import { hojeISO, somarDias } from '@/lib/datas'
import type { Segmento, ServicoId, UF, UsuariaId } from '@/types'

interface Form {
  nome: string
  cidade: string
  uf: UF
  segmento: Segmento
  decisor: string
  cargo: string
  telefone: string
  servico: ServicoId
  responsavel: UsuariaId
  valor: string
  quando: 'hoje' | 'amanha' | 'semana'
}

export function NovaEmpresaDialog() {
  const { novaEmpresa, fecharNovaEmpresa } = useUi()
  const { criarEmpresa, usuariaAtual, config } = useCrm()
  const { abrir } = useFicha()
  const vazio = (): Form => ({
    nome: '',
    cidade: '',
    uf: 'MG',
    segmento: 'Indústria',
    decisor: '',
    cargo: '',
    telefone: '',
    servico: 'recrutamento',
    responsavel: usuariaAtual.id,
    valor: '',
    quando: 'hoje',
  })
  const [f, setF] = useState<Form>(vazio)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (novaEmpresa.aberta) {
      setF(vazio())
      setErro(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novaEmpresa.aberta])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }))

  async function enviar(ev: FormEvent) {
    ev.preventDefault()
    if (!f.nome.trim()) {
      setErro(true)
      return
    }
    const empresa = await criarEmpresa({
      nome: f.nome.trim(),
      segmento: f.segmento,
      porte: 'Média',
      cidade: f.cidade.trim() || 'Não informada',
      uf: f.uf,
      decisor: { nome: f.decisor.trim() || 'A definir', cargo: f.cargo.trim(), telefone: f.telefone.trim() },
      servicos: [f.servico],
      status: 'funil',
      etapaId: novaEmpresa.etapa,
      responsavelId: f.responsavel,
      valorEstimado: Number(f.valor.replace(/\D/g, '')) || 0,
      proximoContato: f.quando === 'hoje' ? hojeISO() : f.quando === 'amanha' ? somarDias(1) : somarDias(7),
      proximaAcao: 'Mandar a primeira mensagem',
      origem: 'manual',
    })
    fecharNovaEmpresa()
    toast.success('Empresa cadastrada', {
      description: `${empresa.nome} entrou no funil.`,
      action: { label: 'Abrir ficha', onClick: () => abrir(empresa.id) },
    })
  }

  return (
    <Dialog open={novaEmpresa.aberta} onOpenChange={(v) => !v && fecharNovaEmpresa()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova empresa</DialogTitle>
          <DialogDescription>Só o nome é obrigatório. O resto dá para completar depois na ficha.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
          <Campo id="ne-nome" label="Nome da empresa *">
            <Input
              id="ne-nome"
              autoFocus
              value={f.nome}
              onChange={(e) => {
                set('nome', e.target.value)
                setErro(false)
              }}
              placeholder="Ex.: Metalúrgica Serra Azul"
              aria-invalid={erro}
              aria-describedby={erro ? 'ne-nome-erro' : undefined}
              className={erro ? 'border-danger' : undefined}
            />
            {erro && (
              <p id="ne-nome-erro" className="text-[13px] text-[#F87171]">
                Escreva o nome da empresa.
              </p>
            )}
          </Campo>
          <div className="grid gap-4 sm:grid-cols-[1fr_110px_1fr]">
            <Campo id="ne-cidade" label="Cidade">
              <Input id="ne-cidade" value={f.cidade} onChange={(e) => set('cidade', e.target.value)} placeholder="Ex.: Uberlândia" />
            </Campo>
            <Campo id="ne-uf" label="Estado">
              <Select value={f.uf} onValueChange={(v) => set('uf', v as UF)}>
                <SelectTrigger id="ne-uf">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UFS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo id="ne-seg" label="Segmento">
              <Select value={f.segmento} onValueChange={(v) => set('segmento', v as Segmento)}>
                <SelectTrigger id="ne-seg">
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
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo id="ne-decisor" label="Com quem falar">
              <Input id="ne-decisor" value={f.decisor} onChange={(e) => set('decisor', e.target.value)} placeholder="Nome" />
            </Campo>
            <Campo id="ne-cargo" label="Cargo">
              <Input id="ne-cargo" value={f.cargo} onChange={(e) => set('cargo', e.target.value)} placeholder="Ex.: Gerente de RH" />
            </Campo>
            <Campo id="ne-tel" label="WhatsApp / telefone">
              <Input id="ne-tel" type="tel" inputMode="tel" value={f.telefone} onChange={(e) => set('telefone', e.target.value)} placeholder="(34) 99999-0000" />
            </Campo>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo id="ne-serv" label="Serviço de interesse">
              <Select value={f.servico} onValueChange={(v) => set('servico', v as ServicoId)}>
                <SelectTrigger id="ne-serv">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICOS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo id="ne-resp" label="Responsável">
              <Select value={f.responsavel} onValueChange={(v) => set('responsavel', v as UsuariaId)}>
                <SelectTrigger id="ne-resp">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.usuarias.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo id="ne-valor" label="Valor estimado (R$)">
              <Input id="ne-valor" inputMode="numeric" value={f.valor} onChange={(e) => set('valor', e.target.value)} placeholder="Ex.: 12000" />
            </Campo>
          </div>
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-muted-foreground">Quando fazer o primeiro contato?</legend>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['hoje', 'Hoje'],
                  ['amanha', 'Amanhã'],
                  ['semana', 'Em 1 semana'],
                ] as const
              ).map(([id, nome]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={f.quando === id}
                  onClick={() => set('quando', id)}
                  className={
                    f.quando === id
                      ? 'h-11 rounded-[12px] border border-primary bg-primary/12 text-sm font-semibold text-white'
                      : 'h-11 rounded-[12px] border border-border bg-[#101010] text-sm font-semibold text-muted-foreground hover:text-foreground'
                  }
                >
                  {nome}
                </button>
              ))}
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="ghost" size="lg" onClick={fecharNovaEmpresa}>
              Cancelar
            </Button>
            <Button type="submit" size="lg">
              <Plus />
              Cadastrar empresa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
