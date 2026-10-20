import type { Metadata } from 'next';
import { fromZonedTime } from 'date-fns-tz';
import { CalendarCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import { CardEnvio, type LeadCard } from '@/components/card-envio';
import { EmptyState } from '@/components/empty-state';
import { dataPorExtenso, FUSO_PADRAO, hojeNoFuso } from '@/domain/dates';
import { rotuloCidade } from '@/domain/vendas/campos';
import {
  cidadesParaAbordar,
  descreverAtraso,
  escolherCidade,
  filaAbordagem,
  followupsDeHoje,
} from '@/domain/vendas/hoje';
import { preencherModelo, proximoModelo } from '@/domain/vendas/modelos';
import { ROTAS } from '@/lib/rotas';
import { cn } from '@/lib/utils';
import { exigirGui } from '@/server/guard';
import {
  contarAbordagens,
  encerrarSemResposta,
  listarLeadsHoje,
  type LeadVendas,
} from '@/server/vendas/leads';
import { carregarAjustes, listarModelos } from '@/server/vendas/modelos';

export const metadata: Metadata = { title: 'Hoje' };
export const dynamic = 'force-dynamic';

const POR_VEZ = 10;

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

function paraCard(l: LeadVendas): LeadCard {
  return {
    id: l.id,
    nome: l.nome,
    local: l.cidade || l.uf ? rotuloCidade(l.cidade, l.uf) : null,
    prioridade: l.prioridade,
    segmento: l.segmento,
    categoria: l.categoria,
    avaliacoes: l.avaliacoes,
    etapa: l.etapa,
    telefone: l.telefone,
    whatsapp: l.whatsapp,
  };
}

export default async function PaginaHoje({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirGui();
  const params = await searchParams;
  const hoje = hojeNoFuso();
  await encerrarSemResposta(hoje);
  const [leads, modelos, ajustes, feitas] = await Promise.all([
    listarLeadsHoje(hoje),
    listarModelos(),
    carregarAjustes(),
    contarAbordagens(fromZonedTime(`${hoje}T00:00:00`, FUSO_PADRAO)),
  ]);

  const followups = followupsDeHoje(leads, hoje);
  const cidades = cidadesParaAbordar(leads);
  const cidade = escolherCidade(cidades, um(params.cidade));
  const fila = cidade ? filaAbordagem(leads, cidade.chave) : [];
  const mostrar = um(params.todos) ? fila.length : POR_VEZ;
  const meta = ajustes.metaDiaria;
  const progresso = Math.min(1, feitas / meta);
  const texto = (l: LeadVendas, chave: keyof typeof modelos) => preencherModelo(modelos[chave], l);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold">Hoje</h1>
          <p className="text-muted-foreground text-sm first-letter:uppercase">
            {dataPorExtenso(hoje)}
          </p>
        </div>
        <section
          className="bg-card rounded-card flex flex-col gap-2 border p-4"
          aria-label="Meta do dia"
          data-testid="meta-dia"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-titulo text-2xl font-bold tabular-nums">
              <span className="text-primary" data-testid="abordagens-hoje">
                {feitas}
              </span>{' '}
              <span className="text-muted-foreground text-lg font-semibold">
                de {meta} abordagens
              </span>
            </p>
            <span className="text-muted-foreground text-sm">
              {feitas >= meta ? 'Meta batida' : `Faltam ${meta - feitas}`}
            </span>
          </div>
          <div className="bg-muted h-2.5 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${progresso * 100}%` }}
            />
          </div>
        </section>
      </header>

      {followups.length > 0 && (
        <section className="flex flex-col gap-3" data-testid="secao-followups">
          <h2 className="text-xl font-bold">
            Follow-ups de hoje{' '}
            <span className="text-muted-foreground font-semibold">{followups.length}</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {followups.map((l) => {
              const chave = proximoModelo(l);
              return (
                <CardEnvio
                  key={l.id}
                  lead={paraCard(l)}
                  chave={chave}
                  texto={chave ? texto(l, chave) : ''}
                  aviso={descreverAtraso(l.diasAtraso)}
                />
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3" data-testid="secao-abordar">
        <h2 className="text-xl font-bold">
          Abordar hoje{' '}
          {cidade && <span className="text-muted-foreground font-semibold">{cidade.total}</span>}
        </h2>
        {cidades.length > 1 && (
          <nav aria-label="Cidade" className="-mx-4 overflow-x-auto px-4">
            <ul className="flex w-max gap-2">
              {cidades.map((c) => (
                <li key={c.chave}>
                  <Link
                    href={`${ROTAS.hoje}?cidade=${encodeURIComponent(c.chave)}`}
                    aria-current={c.chave === cidade?.chave ? 'true' : undefined}
                    className={cn(
                      'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap',
                      c.chave === cidade?.chave
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    <MapPin className="size-3.5" aria-hidden />
                    {c.rotulo}
                    <span className="tabular-nums opacity-75">
                      {c.a ? `${c.a} A · ${c.total}` : c.total}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {cidade ? (
          <>
            {cidades.length === 1 && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="size-4" aria-hidden /> {cidade.rotulo}
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {fila.slice(0, mostrar).map((l) => (
                <CardEnvio
                  key={l.id}
                  lead={paraCard(l)}
                  chave="mensagem_1"
                  texto={texto(l, 'mensagem_1')}
                />
              ))}
            </ul>
            {fila.length > mostrar && (
              <Link
                href={`${ROTAS.hoje}?cidade=${encodeURIComponent(cidade.chave)}&todos=1`}
                className="rounded-control text-muted-foreground min-h-12 border border-dashed px-4 py-3 text-center text-sm font-semibold"
              >
                Mostrar os outros {fila.length - mostrar} de {cidade.rotulo}
              </Link>
            )}
          </>
        ) : (
          <EmptyState icone={CalendarCheck} titulo="Ninguém para abordar">
            Todos os leads já foram contatados.{' '}
            <Link href={ROTAS.importar} className="text-primary font-semibold">
              Importe uma planilha
            </Link>{' '}
            para continuar.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
