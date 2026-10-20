'use client';

import { FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { BOTAO_PRINCIPAL, BOTAO_SECUNDARIO } from '@/components/enviar-whatsapp';
import { ROTAS } from '@/lib/rotas';
import { cn } from '@/lib/utils';
import {
  importarLeads,
  previsualizarImportacao,
  type LinhaPrevia,
  type PreviaImportacao,
} from '@/server/actions/importar';

const SITUACAO: Record<LinhaPrevia['situacao'], { rotulo: string; classe: string }> = {
  nova: { rotulo: 'Nova', classe: 'bg-sucesso/15 text-sucesso' },
  invalida: { rotulo: 'Com erro', classe: 'bg-erro/15 text-erro' },
  repetida: { rotulo: 'Repetida no arquivo', classe: 'bg-alerta/15 text-alerta' },
  ja_cadastrada: { rotulo: 'Já cadastrada', classe: 'bg-muted text-muted-foreground' },
};

type Origem = { tipo: 'arquivo'; arquivo: File } | { tipo: 'pasta'; nome: string };

function formulario(o: Origem): FormData {
  const f = new FormData();
  if (o.tipo === 'arquivo') f.set('arquivo', o.arquivo);
  else f.set('pasta', o.nome);
  return f;
}

/** Importar CSV ou XLSX: resumo antes de gravar (novos, duplicados, com erro) e depois grava. */
export function Importar({ pasta }: { pasta: { nome: string; bytes: number }[] }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [origem, setOrigem] = useState<Origem | null>(null);
  const [previa, setPrevia] = useState<PreviaImportacao | null>(null);
  const [erro, setErro] = useState('');
  const [verTudo, setVerTudo] = useState(false);

  const verPrevia = (o: Origem) => {
    setOrigem(o);
    setPrevia(null);
    setErro('');
    iniciar(async () => {
      const r = await previsualizarImportacao(formulario(o));
      if (!r.ok) return setErro(r.erro);
      setPrevia(r.dados ?? null);
    });
  };

  const problemas = previa?.linhas.filter((l) => l.situacao !== 'nova' || l.avisos.length) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-card rounded-card flex flex-col gap-4 border p-4">
        <p className="text-muted-foreground text-sm">
          Colunas reconhecidas: <b>NOME DA EMPRESA</b>, <b>NUMERO</b> (ou WHATSAPP), AVALIAÇÕES,
          CIDADE, CATEGORIA DE NEGOCIO, SEGMENTO, PRIORIDADE, STATUS e ORIGEM, em qualquer ordem.
          Telefone que já existe nunca entra de novo.
        </p>
        {pasta.length > 0 && (
          <div className="flex flex-col gap-2" data-testid="pasta-import">
            <p className="text-sm font-semibold">Na pasta import</p>
            {pasta.map((a) => (
              <button
                key={a.nome}
                type="button"
                disabled={pendente}
                onClick={() => verPrevia({ tipo: 'pasta', nome: a.nome })}
                className={cn(BOTAO_SECUNDARIO, 'justify-start')}
              >
                <FileSpreadsheet className="text-primary size-5" aria-hidden />
                {a.nome}
                <span className="text-muted-foreground ml-auto text-xs font-normal">
                  {Math.ceil(a.bytes / 1024)} KB
                </span>
              </button>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {pasta.length > 0 ? 'Ou escolha um arquivo' : 'Arquivo CSV ou XLSX'}
          <input
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            data-testid="arquivo"
            className="file:rounded-control file:bg-muted text-sm font-normal file:mr-3 file:min-h-12 file:border-0 file:px-4 file:font-semibold file:text-current"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) verPrevia({ tipo: 'arquivo', arquivo });
            }}
          />
        </label>
        {pendente && !previa && <p className="text-muted-foreground text-sm">Lendo a planilha…</p>}
        {erro && (
          <p role="alert" className="text-erro text-sm" data-testid="erro-importacao">
            {erro}
          </p>
        )}
      </section>

      {previa && origem && (
        <section className="flex flex-col gap-3" data-testid="previa-importacao">
          <div className="bg-card rounded-card flex flex-col gap-3 border p-4">
            <p className="text-muted-foreground text-sm">{previa.arquivo}</p>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-primary/10 rounded-control p-3">
                <dd
                  className="text-primary font-titulo text-3xl font-bold tabular-nums"
                  data-testid="qtd-novos"
                >
                  {previa.novas}
                </dd>
                <dt className="text-xs font-semibold">{previa.novas === 1 ? 'novo' : 'novos'}</dt>
              </div>
              <div className="bg-muted rounded-control p-3">
                <dd
                  className="font-titulo text-3xl font-bold tabular-nums"
                  data-testid="qtd-duplicados"
                >
                  {previa.repetidas + previa.jaCadastradas}
                </dd>
                <dt className="text-xs font-semibold">duplicados</dt>
              </div>
              <div className="bg-muted rounded-control p-3">
                <dd
                  className={cn(
                    'font-titulo text-3xl font-bold tabular-nums',
                    previa.invalidas && 'text-erro',
                  )}
                  data-testid="qtd-erros"
                >
                  {previa.invalidas}
                </dd>
                <dt className="text-xs font-semibold">com erro</dt>
              </div>
            </dl>
            {previa.repetidas + previa.jaCadastradas > 0 && (
              <p className="text-muted-foreground text-xs">
                Duplicados: {previa.jaCadastradas} já cadastrados e {previa.repetidas} repetidos
                dentro do arquivo.
              </p>
            )}
            <button
              type="button"
              className={BOTAO_PRINCIPAL}
              disabled={pendente || previa.novas === 0}
              data-testid="confirmar-importacao"
              onClick={() =>
                iniciar(async () => {
                  const r = await importarLeads(formulario(origem));
                  if (!r.ok) return setErro(r.erro);
                  router.push(`${ROTAS.leads}?importados=${r.dados?.importados ?? 0}`);
                })
              }
            >
              {pendente
                ? 'Gravando…'
                : previa.novas
                  ? `Gravar ${previa.novas} ${previa.novas === 1 ? 'lead novo' : 'leads novos'}`
                  : 'Nada novo para gravar'}
            </button>
          </div>

          {problemas.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="font-bold">Linhas para conferir</h2>
              <ul className="bg-card rounded-card divide-y border text-sm">
                {(verTudo ? problemas : problemas.slice(0, 30)).map((l) => (
                  <li key={l.linha} className="flex items-start justify-between gap-2 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="text-muted-foreground mr-2 tabular-nums">L{l.linha}</span>
                      <span className="font-semibold">{l.nome || '(sem nome)'}</span>
                      {l.telefone && (
                        <span className="text-muted-foreground block text-xs">{l.telefone}</span>
                      )}
                      {l.erro && <span className="text-erro block text-xs">{l.erro}</span>}
                      {l.avisos.map((a) => (
                        <span key={a} className="text-alerta block text-xs">
                          {a}
                        </span>
                      ))}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                        SITUACAO[l.situacao].classe,
                      )}
                    >
                      {SITUACAO[l.situacao].rotulo}
                    </span>
                  </li>
                ))}
              </ul>
              {!verTudo && problemas.length > 30 && (
                <button type="button" className={BOTAO_SECUNDARIO} onClick={() => setVerTudo(true)}>
                  Ver todas as {problemas.length}
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
