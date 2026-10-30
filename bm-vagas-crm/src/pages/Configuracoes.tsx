import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { Pagina } from '@/components/common/Pagina'
import { CabecalhoPagina } from '@/components/common/CabecalhoPagina'
import { Campo } from '@/components/common/Campo'
import { AvatarUsuaria } from '@/components/common/AvatarUsuaria'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useCrm } from '@/store/CrmProvider'
import { COR_ETAPA } from '@/lib/constantes'
import { uid } from '@/lib/utils'
import type { Configuracoes as Config } from '@/types'

function Secao({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-border py-8 first:border-0 first:pt-0 lg:grid-cols-[280px_1fr] lg:gap-10">
      <div>
        <h2 className="font-display text-lg font-bold">{titulo}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{texto}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default function Configuracoes() {
  const { carregando, config, salvarConfig, restaurarExemplo } = useCrm()
  const [rascunho, setRascunho] = useState<Config>(config)
  const [confirmar, setConfirmar] = useState(false)
  useEffect(() => setRascunho(config), [config])

  const alterado = JSON.stringify(rascunho) !== JSON.stringify(config)

  async function salvar() {
    const limpo: Config = {
      ...rascunho,
      etapas: rascunho.etapas.map((e, i) => ({ ...e, nome: e.nome.trim() || config.etapas[i].nome })),
      modelos: rascunho.modelos.filter((m) => m.texto.trim()),
    }
    await salvarConfig(limpo)
    toast.success('Configurações salvas')
  }

  async function restaurar() {
    await restaurarExemplo()
    setConfirmar(false)
    toast.success('Dados de exemplo restaurados')
  }

  if (carregando) {
    return (
      <Pagina>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-8 h-[500px] rounded-[14px]" />
      </Pagina>
    )
  }

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo="Ajustes simples do sistema."
        acoes={
          <Button size="lg" onClick={salvar} disabled={!alterado}>
            <Save /> Salvar
          </Button>
        }
      />

      <div className="surface mt-7 p-5 sm:p-8">
        <Secao titulo="Usuárias" texto="Quem usa o sistema. O nome aparece na saudação e na assinatura das mensagens.">
          <div className="grid gap-4 md:grid-cols-2">
            {rascunho.usuarias.map((u, i) => (
              <div key={u.id} className="rounded-[14px] border border-transparent bg-surface-2 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <AvatarUsuaria id={u.id} tamanho="lg" comDica={false} />
                  <p className="font-display text-lg font-bold">
                    {u.nome} {u.sobrenome}
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Campo id={`u-nome-${u.id}`} label="Nome">
                      <Input
                        id={`u-nome-${u.id}`}
                        value={u.nome}
                        onChange={(e) =>
                          setRascunho((r) => ({ ...r, usuarias: r.usuarias.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)) }))
                        }
                      />
                    </Campo>
                    <Campo id={`u-sob-${u.id}`} label="Sobrenome">
                      <Input
                        id={`u-sob-${u.id}`}
                        value={u.sobrenome}
                        onChange={(e) =>
                          setRascunho((r) => ({ ...r, usuarias: r.usuarias.map((x, j) => (j === i ? { ...x, sobrenome: e.target.value } : x)) }))
                        }
                      />
                    </Campo>
                  </div>
                  <Campo id={`u-tel-${u.id}`} label="WhatsApp">
                    <Input
                      id={`u-tel-${u.id}`}
                      type="tel"
                      value={u.telefone}
                      onChange={(e) =>
                        setRascunho((r) => ({ ...r, usuarias: r.usuarias.map((x, j) => (j === i ? { ...x, telefone: e.target.value } : x)) }))
                      }
                    />
                  </Campo>
                  <Campo id={`u-email-${u.id}`} label="E-mail">
                    <Input
                      id={`u-email-${u.id}`}
                      type="email"
                      value={u.email}
                      onChange={(e) =>
                        setRascunho((r) => ({ ...r, usuarias: r.usuarias.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)) }))
                      }
                    />
                  </Campo>
                </div>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo="Etapas do funil" texto="Mude os nomes para o jeito que vocês falam. Cada etapa pode sugerir um modelo de mensagem.">
          <ol className="flex flex-col gap-2.5">
            {rascunho.etapas.map((e, i) => (
              <li key={e.id} className="grid items-center gap-2.5 rounded-[12px] border border-transparent bg-surface-2 p-2.5 sm:grid-cols-[auto_1fr_240px]">
                <span className="flex items-center gap-2.5 pl-1.5">
                  <span className="font-display text-sm font-bold text-muted-foreground tabular">{i + 1}</span>
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: COR_ETAPA[e.id] }} aria-hidden />
                </span>
                <div>
                  <label htmlFor={`etapa-${e.id}`} className="sr-only">
                    Nome da etapa {i + 1}
                  </label>
                  <Input
                    id={`etapa-${e.id}`}
                    value={e.nome}
                    onChange={(ev) =>
                      setRascunho((r) => ({ ...r, etapas: r.etapas.map((x, j) => (j === i ? { ...x, nome: ev.target.value } : x)) }))
                    }
                  />
                </div>
                <Select
                  value={e.modeloId ?? ''}
                  onValueChange={(v) =>
                    setRascunho((r) => ({ ...r, etapas: r.etapas.map((x, j) => (j === i ? { ...x, modeloId: v } : x)) }))
                  }
                >
                  <SelectTrigger aria-label={`Mensagem sugerida para ${e.nome}`}>
                    <SelectValue placeholder="Mensagem sugerida" />
                  </SelectTrigger>
                  <SelectContent>
                    {rascunho.modelos.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome || 'Sem nome'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ol>
        </Secao>

        <Secao
          titulo="Modelos de mensagem"
          texto="Textos prontos para copiar ou abrir no WhatsApp. Use {nome}, {empresa}, {cidade} e {meu_nome}: o sistema troca sozinho."
        >
          <div className="flex flex-col gap-3">
            {rascunho.modelos.map((m, i) => (
              <div key={m.id} className="rounded-[14px] border border-transparent bg-surface-2 p-4">
                <div className="flex items-end gap-2">
                  <Campo id={`m-nome-${m.id}`} label="Nome do modelo" className="flex-1">
                    <Input
                      id={`m-nome-${m.id}`}
                      value={m.nome}
                      onChange={(e) =>
                        setRascunho((r) => ({ ...r, modelos: r.modelos.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)) }))
                      }
                    />
                  </Campo>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Apagar modelo ${m.nome}`}
                    onClick={() => setRascunho((r) => ({ ...r, modelos: r.modelos.filter((_, j) => j !== i) }))}
                    disabled={rascunho.modelos.length <= 1}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <label htmlFor={`m-texto-${m.id}`} className="sr-only">
                  Texto do modelo {m.nome}
                </label>
                <Textarea
                  id={`m-texto-${m.id}`}
                  className="mt-3"
                  rows={3}
                  value={m.texto}
                  onChange={(e) =>
                    setRascunho((r) => ({ ...r, modelos: r.modelos.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)) }))
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="lg"
              className="self-start"
              onClick={() =>
                setRascunho((r) => ({ ...r, modelos: [...r.modelos, { id: uid('m'), nome: 'Novo modelo', texto: 'Olá, {nome}! ' }] }))
              }
            >
              <Plus /> Novo modelo
            </Button>
          </div>
        </Secao>

        <Secao titulo="Dados de exemplo" texto="Nesta versão, tudo fica salvo só neste navegador. Dá para voltar aos dados de exemplo quando quiser.">
          <Button variant="destructive" size="lg" onClick={() => setConfirmar(true)}>
            <RotateCcw /> Restaurar dados de exemplo
          </Button>
        </Secao>
      </div>

      <Dialog open={confirmar} onOpenChange={setConfirmar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar os dados de exemplo?</DialogTitle>
            <DialogDescription>
              Tudo o que vocês registraram neste navegador será apagado e as 30 empresas de exemplo voltam ao estado inicial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="lg" onClick={() => setConfirmar(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="lg" onClick={restaurar}>
              Sim, restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barra de salvar no celular */}
      {alterado && (
        <div className="fixed inset-x-3 bottom-[84px] z-20 flex items-center gap-3 rounded-[14px] border border-border bg-surface/95 p-2.5 pl-4 shadow-2xl backdrop-blur lg:hidden">
          <span className="flex-1 text-sm text-warning-ink">Alterações não salvas</span>
          <Button onClick={salvar}>
            <Save /> Salvar
          </Button>
        </div>
      )}
    </Pagina>
  )
}
