import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Conversa } from '@/components/conversa';
import { FormLead } from '@/components/form-lead';
import { formatData, formatDataHora } from '@/domain/dates';
import { ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { MAX_TENTATIVAS, tipoParaGerar } from '@/domain/vendas/fila';
import { exigirGui } from '@/server/guard';
import { carregarSugestaoPendente, listarMensagens } from '@/server/vendas/conversa';
import { carregarLeadVendas, listarMovimentos } from '@/server/vendas/leads';

export const metadata: Metadata = { title: 'Lead' };
export const dynamic = 'force-dynamic';
// "Gerar resposta" chama a IA, que pode levar mais de um minuto
export const maxDuration = 120;

const UUID = /^[0-9a-f-]{36}$/;
const ORIGEM = { manual: 'Você', agente: 'Copiloto', importacao: 'Importação' } as const;

export default async function LeadVendas({ params }: { params: Promise<{ id: string }> }) {
  await exigirGui();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const l = await carregarLeadVendas(id);
  if (!l) notFound();
  const [movimentos, mensagens, pendente] = await Promise.all([
    listarMovimentos(id),
    listarMensagens(id),
    carregarSugestaoPendente(id),
  ]);
  const encerrado = l.etapa === 'cliente' || l.etapa === 'perdido';
  const rotuloGerar =
    encerrado || l.tentativas >= MAX_TENTATIVAS
      ? null
      : tipoParaGerar(l) === 'abordagem'
        ? 'Gerar abordagem'
        : 'Gerar follow-up';
  return (
    <div className="flex flex-col gap-4" data-testid="lead">
      <Link href="/leads" className="text-primary text-sm font-semibold">
        ← Leads
      </Link>
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{l.nome}</h2>
        <p className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span data-testid="etapa-lead">Etapa: {ROTULO_ETAPA_VENDAS[l.etapa]}</span>
          <span>Tentativas sem resposta: {l.tentativas}</span>
          <span>Cadastrado em {formatData(l.criadoEm)}</span>
          <span>Atualizado em {formatDataHora(l.atualizadoEm)}</span>
        </p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <Conversa
          leadId={l.id}
          naoContatar={l.naoContatar}
          mensagens={mensagens.map((m) => ({
            id: m.id,
            autor: m.autor,
            texto: m.texto,
            quando: formatDataHora(m.criadoEm),
            sugestaoId: m.sugestaoId,
            avaliacao: m.avaliacao,
          }))}
          pendente={
            pendente && {
              id: pendente.id,
              tipo: pendente.tipo,
              entrada: pendente.entrada,
              saida: pendente.saida,
            }
          }
          telefoneE164={l.telefoneE164}
          rotuloGerar={rotuloGerar}
        />
        <div className="flex flex-col gap-4">
          <FormLead
            key={l.atualizadoEm.toISOString()}
            id={l.id}
            inicial={{
              nome: l.nome,
              buffet: l.buffet ?? '',
              telefone: l.telefoneE164 ?? '',
              cidade: l.cidade ?? '',
              origem: l.origem ?? '',
              resumo: l.resumo ?? '',
              proximoFollowup: l.proximoFollowup ?? '',
              naoContatar: l.naoContatar,
            }}
          />
          <section className="flex flex-col gap-2" data-testid="historico-etapas">
            <h3 className="font-bold">Histórico de etapas</h3>
            <ul className="bg-card rounded-card divide-y border text-sm">
              {movimentos.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                >
                  <span>
                    {m.de ? `${ROTULO_ETAPA_VENDAS[m.de]} → ` : ''}
                    <b>{ROTULO_ETAPA_VENDAS[m.para]}</b>
                    {m.motivo && <span className="text-muted-foreground"> · {m.motivo}</span>}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {ORIGEM[m.origem]} · {formatDataHora(m.criadoEm)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
