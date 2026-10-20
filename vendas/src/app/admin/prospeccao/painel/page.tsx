import type { Metadata } from 'next';
import { CheckCircle2, Target } from 'lucide-react';
import { AjustesMetas } from '@/components/ajustes-metas';
import { diaDaSemana, formatData, hojeNoFuso } from '@/domain/dates';
import { ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { montarPainel, porcentagem } from '@/domain/vendas/painel';
import { cn } from '@/lib/utils';
import { exigirGui } from '@/server/guard';
import { dadosPainel, encerrarSemResposta } from '@/server/vendas/leads';
import { carregarAjustes } from '@/server/vendas/modelos';

export const metadata: Metadata = { title: 'Painel' };
export const dynamic = 'force-dynamic';

function Numero({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string;
  valor: string | number;
  detalhe?: string;
}) {
  return (
    <div className="bg-card rounded-card flex flex-col gap-0.5 border p-4">
      <dt className="text-muted-foreground text-xs font-semibold">{rotulo}</dt>
      <dd className="font-titulo text-3xl font-bold tabular-nums">{valor}</dd>
      {detalhe && <dd className="text-muted-foreground text-xs">{detalhe}</dd>}
    </div>
  );
}

function Prazo({ dias }: { dias: number }) {
  if (dias > 1) return <>faltam {dias} dias</>;
  if (dias === 1) return <>falta 1 dia</>;
  if (dias === 0) return <>vence hoje</>;
  return (
    <>
      venceu há {-dias} {dias === -1 ? 'dia' : 'dias'}
    </>
  );
}

export default async function PaginaPainel() {
  await exigirGui();
  const hoje = hojeNoFuso();
  await encerrarSemResposta(hoje);
  const [{ leads, movimentos }, ajustes] = await Promise.all([dadosPainel(), carregarAjustes()]);
  const p = montarPainel({ leads, movimentos, hoje, inicioMetas: ajustes.inicioMetas });
  const maiorEtapa = Math.max(1, ...p.funil.map((f) => f.quantidade));
  const meta = ajustes.metaDiaria;
  // folga em cima para o número da barra mais alta caber
  const topoSemana = Math.max(meta, ...p.semana.map((s) => s.abordagens)) * 1.2;
  const { primeiraVenda, dezClientes } = p.metas;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Painel</h1>

      <section aria-label="Metas" className="grid gap-3 sm:grid-cols-2" data-testid="metas">
        <div className="bg-card rounded-card flex flex-col gap-2 border p-4">
          <p className="flex items-center gap-2 font-semibold">
            {primeiraVenda.feito ? (
              <CheckCircle2 className="text-primary size-5" aria-hidden />
            ) : (
              <Target className="text-muted-foreground size-5" aria-hidden />
            )}
            Primeira venda em 1 mês
          </p>
          <p className="font-titulo text-2xl font-bold">
            {primeiraVenda.feito ? 'Feito' : 'Ainda não'}
          </p>
          <p className="text-muted-foreground text-xs">
            Prazo {formatData(primeiraVenda.prazo)}, <Prazo dias={primeiraVenda.diasRestantes} />
          </p>
        </div>
        <div className="bg-card rounded-card flex flex-col gap-2 border p-4">
          <p className="flex items-center gap-2 font-semibold">
            <Target className="text-muted-foreground size-5" aria-hidden />
            10 clientes em 3 meses
          </p>
          <p className="font-titulo text-2xl font-bold tabular-nums" data-testid="clientes-meta">
            {dezClientes.fechados}{' '}
            <span className="text-muted-foreground text-lg">de {dezClientes.alvo}</span>
          </p>
          <div
            className="bg-muted h-2.5 overflow-hidden rounded-full"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={dezClientes.alvo}
            aria-valuenow={dezClientes.fechados}
            aria-label="Clientes fechados"
          >
            <div
              className="bg-primary h-full rounded-full"
              style={{
                width: `${Math.min(100, (dezClientes.fechados / dezClientes.alvo) * 100)}%`,
              }}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Prazo {formatData(dezClientes.prazo)}, <Prazo dias={dezClientes.diasRestantes} />
          </p>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="numeros">
        <Numero rotulo="Leads" valor={p.total} />
        <Numero rotulo="Contatados" valor={p.contatados} />
        <Numero
          rotulo="Taxa de resposta"
          valor={porcentagem(p.taxaResposta)}
          detalhe={`${p.responderam} de ${p.contatados} responderam`}
        />
        <Numero rotulo="Fechados" valor={p.fechados} />
      </dl>

      <section
        className="bg-card rounded-card flex flex-col gap-3 border p-4"
        aria-labelledby="t-funil"
      >
        <h2 id="t-funil" className="text-lg font-bold">
          Funil
        </h2>
        <ul className="flex flex-col gap-2.5" data-testid="funil">
          {p.funil.map((f) => (
            <li
              key={f.etapa}
              className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-2 text-sm"
            >
              <span className="text-muted-foreground truncate">{ROTULO_ETAPA_VENDAS[f.etapa]}</span>
              <span className="h-5" title={`${ROTULO_ETAPA_VENDAS[f.etapa]}: ${f.quantidade}`}>
                <span
                  className="bg-primary block h-full rounded-r-[4px]"
                  style={{
                    width: `${(f.quantidade / maiorEtapa) * 100}%`,
                    minWidth: f.quantidade ? 4 : 0,
                  }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">{f.quantidade}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="bg-card rounded-card flex flex-col gap-3 border p-4"
        aria-labelledby="t-semana"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="t-semana" className="text-lg font-bold">
            Abordagens nos últimos 7 dias
          </h2>
          <span className="text-muted-foreground text-xs">meta {meta} por dia</span>
        </div>
        <div className="relative flex h-40 items-end gap-2 border-b" data-testid="semana">
          <div
            className="border-muted-foreground/50 pointer-events-none absolute inset-x-0 border-t border-dashed"
            style={{ bottom: `${(meta / topoSemana) * 100}%` }}
            aria-hidden
          />
          {p.semana.map((s) => (
            <div
              key={s.dia}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`${formatData(s.dia)}: ${s.abordagens} ${s.abordagens === 1 ? 'abordagem' : 'abordagens'}`}
            >
              <span className="text-xs font-semibold tabular-nums">{s.abordagens || ''}</span>
              <span
                className={cn(
                  'block w-full max-w-6 rounded-t-[4px]',
                  s.abordagens >= meta ? 'bg-primary' : 'bg-primary/60',
                )}
                style={{ height: `${(s.abordagens / topoSemana) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {p.semana.map((s) => (
            <span
              key={s.dia}
              className={cn(
                'text-muted-foreground flex-1 text-center text-[11px]',
                s.dia === hoje && 'text-foreground font-bold',
              )}
            >
              {s.dia === hoje ? 'hoje' : diaDaSemana(s.dia).slice(0, 3)}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          Barra cheia: bateu a meta do dia. Linha tracejada: a meta.
        </p>
      </section>

      <section className="flex flex-col gap-2" aria-labelledby="t-cidades">
        <h2 id="t-cidades" className="text-lg font-bold">
          Por cidade
        </h2>
        {p.porCidade.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum lead ainda.</p>
        ) : (
          <div className="bg-card rounded-card overflow-x-auto border">
            <table className="w-full text-sm" data-testid="por-cidade">
              <thead className="text-muted-foreground text-xs">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-semibold">Cidade</th>
                  <th className="px-2 py-2 text-right font-semibold">Leads</th>
                  <th className="px-2 py-2 text-right font-semibold">Contat.</th>
                  <th className="px-2 py-2 text-right font-semibold">Resp.</th>
                  <th className="px-3 py-2 text-right font-semibold">Fech.</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {p.porCidade.map((c) => (
                  <tr key={c.rotulo}>
                    <td className="px-3 py-2.5">{c.rotulo}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{c.total}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{c.contatados}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {c.responderam}
                      {c.contatados > 0 && (
                        <span className="text-muted-foreground text-xs">
                          {' '}
                          {Math.round((c.responderam / c.contatados) * 100)}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                      {c.fechados}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        className="bg-card rounded-card flex flex-col gap-3 border p-4"
        aria-labelledby="t-ajustes"
      >
        <h2 id="t-ajustes" className="text-lg font-bold">
          Ajustar metas
        </h2>
        <AjustesMetas metaDiaria={ajustes.metaDiaria} inicioMetas={ajustes.inicioMetas} />
      </section>
    </div>
  );
}
