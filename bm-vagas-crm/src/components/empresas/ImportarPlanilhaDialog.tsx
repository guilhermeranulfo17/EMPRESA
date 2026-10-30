import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import Papa from 'papaparse'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCrm } from '@/store/CrmProvider'
import type { LinhaImportacao, ResultadoImportacao } from '@/services'
import { normalizar, cn } from '@/lib/utils'
import type { StatusBase } from '@/types'

type CampoDestino = keyof LinhaImportacao

const CAMPOS: { id: CampoDestino; nome: string; obrigatorio?: boolean; apelidos: string[] }[] = [
  { id: 'nome', nome: 'Nome da empresa', obrigatorio: true, apelidos: ['empresa', 'nome', 'razao social', 'nome fantasia', 'company'] },
  { id: 'cidade', nome: 'Cidade', apelidos: ['cidade', 'municipio', 'city'] },
  { id: 'uf', nome: 'Estado (UF)', apelidos: ['uf', 'estado', 'state'] },
  { id: 'segmento', nome: 'Segmento', apelidos: ['segmento', 'setor', 'ramo', 'atividade'] },
  { id: 'decisor', nome: 'Decisor', apelidos: ['decisor', 'contato', 'responsavel', 'nome do contato'] },
  { id: 'cargo', nome: 'Cargo', apelidos: ['cargo', 'funcao'] },
  { id: 'telefone', nome: 'Telefone', apelidos: ['telefone', 'whatsapp', 'celular', 'fone', 'tel'] },
  { id: 'email', nome: 'E-mail', apelidos: ['email', 'e-mail', 'mail'] },
  { id: 'site', nome: 'Site', apelidos: ['site', 'website', 'url'] },
  { id: 'cnpj', nome: 'CNPJ', apelidos: ['cnpj'] },
]

const NAO_USAR = '__nao_usar__'
const MODELO_CSV =
  'empresa;cidade;uf;segmento;decisor;cargo;telefone;email\n' +
  'Indústria Exemplo Ltda;Uberlândia;MG;Indústria;Maria Souza;Gerente de RH;(34) 99999-0000;maria@exemplo.com\n'

function adivinhar(cabecalhos: string[]) {
  const mapa: Partial<Record<CampoDestino, string>> = {}
  for (const campo of CAMPOS) {
    const achado = cabecalhos.find((c) => {
      const n = normalizar(c)
      return campo.apelidos.some((a) => n === a || n.includes(a))
    })
    if (achado && !Object.values(mapa).includes(achado)) mapa[campo.id] = achado
  }
  return mapa
}

type Passo = 'arquivo' | 'mapear' | 'pronto'

export function ImportarPlanilhaDialog({ aberto, onOpenChange }: { aberto: boolean; onOpenChange: (v: boolean) => void }) {
  const { importar } = useCrm()
  const [passo, setPasso] = useState<Passo>('arquivo')
  const [arrastando, setArrastando] = useState(false)
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [cabecalhos, setCabecalhos] = useState<string[]>([])
  const [linhas, setLinhas] = useState<Record<string, string>[]>([])
  const [mapa, setMapa] = useState<Partial<Record<CampoDestino, string>>>({})
  const [destino, setDestino] = useState<StatusBase>('fila')
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null)
  const [importando, setImportando] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const reiniciar = useCallback(() => {
    setPasso('arquivo')
    setNomeArquivo('')
    setCabecalhos([])
    setLinhas([])
    setMapa({})
    setResultado(null)
    setDestino('fila')
  }, [])

  function fechar() {
    onOpenChange(false)
    setTimeout(reiniciar, 250)
  }

  function ler(arquivo: File) {
    if (!/\.(csv|txt)$/i.test(arquivo.name)) {
      toast.error('Esse arquivo não é CSV', { description: 'No Excel ou Google Planilhas: Arquivo > Salvar como / Baixar > CSV.' })
      return
    }
    Papa.parse<Record<string, string>>(arquivo, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const cab = (res.meta.fields ?? []).filter(Boolean)
        if (!cab.length || !res.data.length) {
          toast.error('Não encontrei linhas nessa planilha.')
          return
        }
        setNomeArquivo(arquivo.name)
        setCabecalhos(cab)
        setLinhas(res.data)
        setMapa(adivinhar(cab))
        setPasso('mapear')
      },
      error: () => toast.error('Não consegui ler esse arquivo.'),
    })
  }

  function soltar(e: DragEvent) {
    e.preventDefault()
    setArrastando(false)
    const arquivo = e.dataTransfer.files?.[0]
    if (arquivo) ler(arquivo)
  }

  const convertidas = useMemo<LinhaImportacao[]>(
    () =>
      linhas.map((l) => {
        const out: LinhaImportacao = { nome: '' }
        for (const c of CAMPOS) {
          const col = mapa[c.id]
          if (col) out[c.id] = (l[col] ?? '').toString().trim()
        }
        return out
      }),
    [linhas, mapa],
  )

  async function confirmar() {
    setImportando(true)
    const r = await importar(convertidas, destino)
    setImportando(false)
    setResultado(r)
    setPasso('pronto')
    toast.success(`${r.importadas} ${r.importadas === 1 ? 'empresa importada' : 'empresas importadas'}`, {
      description: r.duplicadas
        ? `${r.duplicadas} ${r.duplicadas === 1 ? 'repetida foi ignorada' : 'repetidas foram ignoradas'}.`
        : undefined,
    })
  }

  function baixarModelo() {
    const blob = new Blob(['﻿' + MODELO_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo-empresas-bm-vagas.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => (v ? onOpenChange(true) : fechar())}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar planilha</DialogTitle>
          <DialogDescription>
            {passo === 'arquivo' && 'Traga suas empresas de uma planilha CSV. Repetidas são ignoradas sozinhas.'}
            {passo === 'mapear' && `${nomeArquivo}: ${linhas.length} linhas encontradas. Confira as colunas.`}
            {passo === 'pronto' && 'Pronto! Suas empresas já estão na base.'}
          </DialogDescription>
        </DialogHeader>

        <ol className="flex items-center gap-2 text-xs font-semibold" aria-label="Etapas da importação">
          {(['arquivo', 'mapear', 'pronto'] as const).map((p, i) => {
            const atual = ['arquivo', 'mapear', 'pronto'].indexOf(passo)
            return (
              <li key={p} className="flex flex-1 items-center gap-2" aria-current={passo === p ? 'step' : undefined}>
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-full border text-[11px]',
                    i < atual && 'border-success bg-success text-white',
                    i === atual && 'border-primary bg-primary text-white',
                    i > atual && 'border-border text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <span className={i <= atual ? 'text-foreground' : 'text-muted-foreground'}>{['Arquivo', 'Conferir', 'Pronto'][i]}</span>
                {i < 2 && <span className="h-px flex-1 bg-border" />}
              </li>
            )
          })}
        </ol>

        <AnimatePresence mode="wait">
          {passo === 'arquivo' && (
            <motion.div key="arquivo" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <button
                type="button"
                onClick={() => input.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setArrastando(true)
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={soltar}
                className={cn(
                  'flex w-full flex-col items-center justify-center rounded-[16px] border-2 border-dashed px-6 py-14 text-center transition-all',
                  arrastando ? 'scale-[1.01] border-primary bg-primary/[0.06]' : 'border-border-strong bg-surface-2 hover:border-border-strong',
                )}
              >
                <motion.span
                  animate={arrastando ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
                  className="grid size-16 place-items-center rounded-[18px] bg-surface-2 text-primary ring-1 ring-border"
                >
                  <Upload className="size-7" />
                </motion.span>
                <span className="mt-5 font-display text-lg font-bold text-foreground">
                  {arrastando ? 'Pode soltar!' : 'Arraste a planilha para cá'}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">ou toque para escolher o arquivo (.csv)</span>
              </button>
              <input
                ref={input}
                type="file"
                accept=".csv,text/csv,.txt"
                className="sr-only"
                aria-label="Escolher planilha CSV"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) ler(f)
                  e.target.value = ''
                }}
              />
              <div className="mt-4 flex flex-col items-start gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>Dica: no Excel, use “Salvar como” e escolha CSV.</span>
                {/* Na página publicada no claude.ai, downloads não funcionam. */}
                {import.meta.env.VITE_ROUTER !== 'memoria' && (
                  <Button variant="link" onClick={baixarModelo} className="h-auto">
                    <Download className="size-4" /> Baixar planilha modelo
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {passo === 'mapear' && (
            <motion.div key="mapear" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-5">
              <div>
                <p className="mb-2.5 text-sm font-semibold text-foreground">Qual coluna da planilha é cada informação?</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {CAMPOS.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-[12px] border border-transparent bg-surface-2 py-1.5 pr-1.5 pl-3.5">
                      <label htmlFor={`map-${c.id}`} className="min-w-0 flex-1 truncate text-sm text-ink-2">
                        {c.nome}
                        {c.obrigatorio && <span className="text-primary"> *</span>}
                      </label>
                      <Select
                        value={mapa[c.id] ?? NAO_USAR}
                        onValueChange={(v) => setMapa((m) => ({ ...m, [c.id]: v === NAO_USAR ? undefined : v }))}
                      >
                        <SelectTrigger id={`map-${c.id}`} className="h-9 w-[48%] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NAO_USAR}>Não usar</SelectItem>
                          {cabecalhos.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2.5 text-sm font-semibold text-foreground">Pré-visualização (primeiras 5 linhas)</p>
                <div className="scrollbar-thin overflow-x-auto rounded-[12px] border border-border">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-surface-2 text-muted-foreground">
                      <tr>
                        {CAMPOS.filter((c) => mapa[c.id]).map((c) => (
                          <th key={c.id} className="px-3 py-2 font-semibold whitespace-nowrap">
                            {c.nome}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {convertidas.slice(0, 5).map((l, i) => (
                        <tr key={i} className="border-t border-border">
                          {CAMPOS.filter((c) => mapa[c.id]).map((c) => (
                            <td key={c.id} className="max-w-[200px] truncate px-3 py-2 whitespace-nowrap text-ink-2">
                              {l[c.id] || <span className="text-subtle">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-foreground">Para onde vão essas empresas?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ['fila', 'Fila de disparo', 'A Lívia manda a primeira mensagem'],
                      ['funil', 'Direto para o funil', 'Entram em “Nova empresa” para vocês'],
                    ] as const
                  ).map(([id, titulo, dica]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={destino === id}
                      onClick={() => setDestino(id)}
                      className={cn(
                        'rounded-[12px] border p-3.5 text-left transition-colors',
                        destino === id ? 'border-primary bg-primary/[0.08]' : 'border-transparent bg-surface-2 hover:border-border-strong',
                      )}
                    >
                      <span className="block text-sm font-semibold text-foreground">{titulo}</span>
                      <span className="block text-[13px] text-muted-foreground">{dica}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </motion.div>
          )}

          {passo === 'pronto' && resultado && (
            <motion.div key="pronto" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="grid size-16 place-items-center rounded-full bg-success text-white"
              >
                <CheckCircle2 className="size-8" />
              </motion.span>
              <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3">
                <div className="rounded-[14px] border border-transparent bg-surface-2 p-4">
                  <p className="font-display text-4xl font-bold text-primary tabular">{resultado.importadas}</p>
                  <p className="mt-1 text-sm text-muted-foreground">importadas</p>
                </div>
                <div className="rounded-[14px] border border-transparent bg-surface-2 p-4">
                  <p className="font-display text-4xl font-bold text-foreground tabular">{resultado.duplicadas}</p>
                  <p className="mt-1 text-sm text-muted-foreground">repetidas ignoradas</p>
                </div>
              </div>
              {resultado.invalidas > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">{resultado.invalidas} linhas sem nome de empresa foram puladas.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {passo === 'mapear' && (
            <>
              <Button variant="ghost" size="lg" onClick={reiniciar}>
                <ArrowLeft /> Outro arquivo
              </Button>
              <Button size="lg" onClick={confirmar} disabled={!mapa.nome || importando}>
                <FileSpreadsheet /> Importar {linhas.length} {linhas.length === 1 ? 'linha' : 'linhas'}
              </Button>
            </>
          )}
          {passo === 'pronto' && (
            <Button size="lg" onClick={fechar}>
              Ver empresas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
