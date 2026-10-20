import type { Metadata } from 'next';
import { Phone, Star } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Assistente } from '@/components/assistente';
import { Avaliar } from '@/components/avaliar';
import { SeloPrioridade } from '@/components/card-envio';
import { BotoesEtapa } from '@/components/etapa-rapida';
import { FormLead } from '@/components/form-lead';
import { MensagensLead } from '@/components/mensagens-lead';
import { formatData, formatDataHora, hojeNoFuso } from '@/domain/dates';
import { ROTULO_SEGMENTO, rotuloCidade } from '@/domain/vendas/campos';
import { ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { proximoModelo, ROTULO_MODELO } from '@/domain/vendas/modelos';
import { ROTAS } from '@/lib/rotas';
import { cn } from '@/lib/utils';
import { exigirGui } from '@/server/guard';
import { carregarSugestaoPendente, listarMensagens } from '@/server/vendas/conversa';
import { carregarLead, listarMovimentos } from '@/server/vendas/leads';
import { listarModelos } from '@/server/vendas/modelos';

export const metadata: Metadata = { title: 'Lead' };
export const dynamic = 'force-dynamic';
// "Analisar com IA" pode levar mais de um minuto
export const maxDuration = 120;

const UUID = /^[0-9a-f-]{36}$/;
const ORIGEM = {
  manual: 'Você',
  agente: 'IA',
  importacao: 'Importação',
  mensagem: 'WhatsApp',
  automatico: 'Automático',
} as const;
const AUTOR = { lead: 'Lead', gui: 'Você', conversa: 'Conversa colada' } as const;

export default async function PaginaLead({ params }: { params: Promise<{ id: string }> }) {
  await exigirGui();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const l = await carregarLead(id);
  if (!l) notFound();
  const [movimentos, mensagens, pendente, modelos] = await Promise.all([
    listarMovimentos(id),
    listarMensagens(id),
    carregarSugestaoPendente(id),
    listarModelos(),
  ]);
  const hoje = hojeNoFuso();
  const atrasado = l.proximoFollowup !== null && l.proximoFollowup <= hoje;
  const info = [
    l.cidade || l.uf ? rotuloCidade(l.cidade, l.uf) : null,
    l.segmento && ROTULO_SEGMENTO[l.segmento],
    l.categoria,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-5" data-testid="lead">
      <Link href={ROTAS.leads} className="text-primary text-sm font-semibold">
        ← Leads
      </Link>
      <header className="flex items-start gap-3">
        <SeloPrioridade prioridade={l.prioridade} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-bold">{l.nome}</h1>
          {info.length > 0 && <p className="text-muted-foreground text-sm">{info.join(' · ')}</p>}
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {l.telefone && (
              <a
                href={`tel:+55${l.telefoneDigitos}`}
                className="text-foreground inline-flex items-center gap-1 font-semibold"
              >
                <Phone className="size-3.5" aria-hidden />
                {l.telefone}
              </a>
            )}
            {!l.whatsapp && l.telefone && <span className="text-xs">Fixo, sem WhatsApp</span>}
            {l.avaliacoes && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5" aria-hidden /> {l.avaliacoes}
              </span>
            )}
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">
            Etapa: <span data-testid="etapa-lead">{ROTULO_ETAPA_VENDAS[l.etapa]}</span>
          </h2>
          <p
            className={cn(
              'text-sm',
              atrasado ? 'text-alerta font-semibold' : 'text-muted-foreground',
            )}
            data-testid="followup-lead"
          >
            {l.proximoFollowup ? `Follow-up ${formatData(l.proximoFollowup)}` : 'Sem follow-up'}
            {l.ultimoModelo && ` · Última: ${ROTULO_MODELO[l.ultimoModelo]}`}
          </p>
        </div>
        <BotoesEtapa key={l.etapa} id={l.id} etapa={l.etapa} />
      </section>

      <div className="grid grid-cols-1 items-start gap-5 *:min-w-0 lg:grid-cols-2">
        <MensagensLead
          lead={l}
          modelos={modelos}
          sugerido={proximoModelo(l) ?? (l.etapa === 'respondeu' ? 'quanto_custa' : 'mensagem_1')}
        />
        <Assistente
          leadId={l.id}
          whatsapp={l.whatsapp}
          naoContatar={l.naoContatar}
          pendente={
            pendente && { id: pendente.id, entrada: pendente.entrada, saida: pendente.saida }
          }
        />
      </div>

      {l.resumo && (
        <section className="bg-card rounded-card border p-4">
          <h2 className="text-muted-foreground text-xs font-semibold uppercase">
            Resumo da conversa
          </h2>
          <p className="mt-1 text-sm">{l.resumo}</p>
        </section>
      )}

      <section className="flex flex-col gap-2" data-testid="historico">
        <h2 className="text-lg font-bold">Histórico</h2>
        <ol className="bg-card rounded-card divide-y border text-sm">
          {[
            ...movimentos.map((m) => ({ tipo: 'etapa' as const, quando: m.criadoEm, m })),
            ...mensagens.map((m) => ({ tipo: 'mensagem' as const, quando: m.criadoEm, m })),
          ]
            .sort((a, b) => b.quando.getTime() - a.quando.getTime())
            .map((item) =>
              item.tipo === 'etapa' ? (
                <li
                  key={item.m.id}
                  className="flex flex-col gap-0.5 px-4 py-3"
                  data-testid="movimento"
                >
                  <span>
                    {item.m.de ? `${ROTULO_ETAPA_VENDAS[item.m.de]} → ` : 'Entrou em '}
                    <b>{ROTULO_ETAPA_VENDAS[item.m.para]}</b>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {ORIGEM[item.m.origem]} · {formatDataHora(item.m.criadoEm)}
                    {item.m.motivo && ` · ${item.m.motivo}`}
                  </span>
                </li>
              ) : (
                <li key={item.m.id} className="flex flex-col gap-1 px-4 py-3">
                  <span className="text-muted-foreground text-xs font-semibold">
                    {AUTOR[item.m.autor]} · {formatDataHora(item.m.criadoEm)}
                  </span>
                  <p
                    className={cn(
                      'whitespace-pre-wrap',
                      item.m.autor === 'conversa' && 'text-muted-foreground line-clamp-4',
                    )}
                  >
                    {item.m.texto}
                  </p>
                  {item.m.sugestaoId && (
                    <Avaliar sugestaoId={item.m.sugestaoId} avaliacao={item.m.avaliacao} />
                  )}
                </li>
              ),
            )}
        </ol>
      </section>

      <details className="bg-card rounded-card border">
        <summary className="cursor-pointer px-4 py-3 font-semibold">Dados do lead</summary>
        <div className="border-t p-4">
          <FormLead
            key={l.atualizadoEm.toISOString()}
            id={l.id}
            inicial={{
              nome: l.nome,
              cidade: l.cidade ?? '',
              uf: l.uf ?? '',
              telefone: l.telefone ?? '',
              categoria: l.categoria ?? '',
              segmento: l.segmento ?? '',
              prioridade: l.prioridade ?? '',
              avaliacoes: l.avaliacoes ?? '',
              origem: l.origem ?? '',
              dataEntrada: l.dataEntrada,
              proximoFollowup: l.proximoFollowup ?? '',
              observacoes: l.observacoes ?? '',
              naoContatar: l.naoContatar,
            }}
          />
          <p className="text-muted-foreground mt-3 text-xs">
            Cadastrado em {formatData(l.criadoEm)}.
          </p>
        </div>
      </details>
    </div>
  );
}
