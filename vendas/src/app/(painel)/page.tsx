import type { Metadata } from 'next';
import { CalendarCheck } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Fila, type ItemFilaTela } from '@/components/fila';
import { hojeNoFuso, dataPorExtenso } from '@/domain/dates';
import { descreverMotivo, montarFila } from '@/domain/vendas/fila';
import { exigirGui } from '@/server/guard';
import { sugestoesPendentes } from '@/server/vendas/conversa';
import { listarLeadsFila } from '@/server/vendas/leads';

export const metadata: Metadata = { title: 'Fila do dia' };
export const dynamic = 'force-dynamic';
// "Gerar mensagem" chama a IA, que pode levar mais de um minuto
export const maxDuration = 120;

export default async function PaginaFilaDoDia() {
  await exigirGui();
  const hoje = hojeNoFuso();
  const [leads, pendentes] = await Promise.all([listarLeadsFila(), sugestoesPendentes()]);
  const fila = montarFila(
    leads.map((l) => ({ ...l, temSugestaoPendente: pendentes.has(l.id) })),
    hoje,
  );
  const itens: ItemFilaTela[] = fila.map((i) => {
    const p = pendentes.get(i.id);
    return {
      id: i.id,
      nome: i.nome,
      buffet: i.buffet,
      cidade: i.cidade,
      etapa: i.etapa,
      resumo: i.resumo,
      tentativas: i.tentativas,
      motivo: i.motivo,
      descricao: descreverMotivo(i),
      telefoneE164: leads.find((l) => l.id === i.id)?.telefoneE164 ?? null,
      pendente: p ? { id: p.id, tipo: p.tipo, entrada: p.entrada, saida: p.saida } : null,
    };
  });
  const conta = (m: ItemFilaTela['motivo']) => itens.filter((i) => i.motivo === m).length;

  if (!itens.length) {
    return (
      <EmptyState icone={CalendarCheck} titulo="Nada na fila hoje">
        Nenhum lead novo e nenhum follow-up vencido. Cadastre ou importe leads na aba Leads.
      </EmptyState>
    );
  }
  const resumo = [
    conta('pendente') && `${conta('pendente')} esperando você`,
    conta('atrasado') && `${conta('atrasado')} atrasados`,
    conta('hoje') && `${conta('hoje')} para hoje`,
    conta('novo') && `${conta('novo')} novos`,
    conta('encerrar') && `${conta('encerrar')} para encerrar`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl font-bold">Fila do dia</h2>
        <p className="text-muted-foreground text-sm" data-testid="resumo-fila">
          {dataPorExtenso(hoje)} · {resumo.join(' · ')}
        </p>
      </header>
      <Fila itens={itens} />
    </div>
  );
}
