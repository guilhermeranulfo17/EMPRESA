import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Campo } from '@/components/common/Campo'
import { SeletorTipo } from '@/components/common/SeletorTipo'
import {
  EscolhaProximoContato,
  resolverProximo,
  valorPadraoProximo,
  type ValorProximoContato,
} from '@/components/common/EscolhaProximoContato'
import { useCrm } from '@/store/CrmProvider'
import { fraseProximoContato } from '@/lib/datas'
import { nomeEtapa } from '@/lib/selecoes'
import type { Empresa, EtapaId, TipoInteracao } from '@/types'

const RESPOSTAS_RAPIDAS = [
  'Não atendeu',
  'Pediu para chamar depois',
  'Pediu proposta',
  'Marcou reunião',
  'Sem interesse agora',
]

/** O "Feito": registra o que aconteceu e já agenda o próximo contato. */
export function RegistrarContatoDialog({
  empresa,
  aberto,
  onOpenChange,
}: {
  empresa: Empresa | null
  aberto: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { registrarContato, config } = useCrm()
  const [tipo, setTipo] = useState<TipoInteracao>('whatsapp')
  const [texto, setTexto] = useState('')
  const [proximo, setProximo] = useState<ValorProximoContato>(valorPadraoProximo)
  const [etapa, setEtapa] = useState<EtapaId | 'manter'>('manter')
  const [acao, setAcao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const idTexto = useId()
  const idAcao = useId()
  const idEtapa = useId()

  useEffect(() => {
    if (aberto) {
      setTipo('whatsapp')
      setTexto('')
      setProximo(valorPadraoProximo())
      setEtapa('manter')
      setAcao('')
    }
  }, [aberto])

  if (!empresa) return null

  async function salvar() {
    if (!empresa) return
    setSalvando(true)
    const dia = resolverProximo(proximo)
    await registrarContato({
      empresaId: empresa.id,
      tipo,
      texto,
      proximoContato: dia,
      proximaAcao: acao,
      novaEtapa: etapa === 'manter' ? undefined : etapa,
    })
    setSalvando(false)
    onOpenChange(false)
    toast.success('Contato registrado', {
      description: `${empresa.nome}. ${dia ? fraseProximoContato(dia) : 'Sem próximo contato marcado'}.`,
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Como foi com a {empresa.nome}?</DialogTitle>
          <DialogDescription>
            Registre em poucas palavras e escolha quando falar com {empresa.decisor.nome.split(' ')[0]} de novo.
          </DialogDescription>
        </DialogHeader>

        <SeletorTipo valor={tipo} onChange={setTipo} />

        <Campo id={idTexto} label="O que aconteceu?">
          <div className="mb-1 flex flex-wrap gap-1.5">
            {RESPOSTAS_RAPIDAS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTexto((t) => (t ? `${t}. ${r}` : r))}
                className="rounded-full border border-transparent bg-surface-2 px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {r}
              </button>
            ))}
          </div>
          <Textarea
            id={idTexto}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex.: Falei com a Patrícia, ela pediu a proposta por e-mail."
            rows={3}
          />
        </Campo>

        <EscolhaProximoContato valor={proximo} onChange={setProximo} permitirNenhum />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id={idAcao} label="Próxima ação (opcional)">
            <Input id={idAcao} value={acao} onChange={(e) => setAcao(e.target.value)} placeholder={empresa.proximaAcao} />
          </Campo>
          <Campo id={idEtapa} label="Mudar de etapa? (opcional)">
            <Select value={etapa} onValueChange={(v) => setEtapa(v as EtapaId | 'manter')}>
              <SelectTrigger id={idEtapa}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manter">Manter em {nomeEtapa(config, empresa.etapaId)}</SelectItem>
                {config.etapas
                  .filter((e) => e.id !== empresa.etapaId)
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Campo>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="lg" onClick={salvar} disabled={salvando}>
            <CheckCircle2 />
            Registrar contato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
