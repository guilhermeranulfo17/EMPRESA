import { formatData } from '@/domain/dates';
import { ROTULO_ANGULO, type SaidaAgente } from '@/domain/vendas/agente';
import { ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs font-semibold uppercase">{rotulo}</dt>
      <dd className="text-sm whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

/** A saída do copiloto: mensagem sugerida em destaque, avisos e o diagnóstico. */
export function SaidaCopiloto({
  saida,
  semMensagem = false,
}: {
  saida: SaidaAgente;
  /** Esconde a mensagem quando ela aparece num campo editável. */
  semMensagem?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {saida.nao_contatar && (
        <p
          className="bg-erro/10 text-erro border-erro/30 rounded-control border p-3 text-sm font-semibold"
          data-testid="aviso-nao-contatar"
        >
          O lead pediu para parar. Responda com educação e não mande mais nada.
        </p>
      )}
      {saida.passar_para_humano && (
        <p
          className="bg-alerta/10 text-alerta border-alerta/30 rounded-control border p-3 text-sm font-semibold"
          data-testid="aviso-humano"
        >
          Hora de você assumir: {saida.motivo || 'o copiloto preferiu passar para você.'}
        </p>
      )}
      {!semMensagem && (
        <div className="bg-muted rounded-control p-3">
          <p className="text-muted-foreground text-xs font-semibold uppercase">Mensagem sugerida</p>
          <p className="mt-1 whitespace-pre-wrap" data-testid="mensagem-ia">
            {saida.mensagem}
          </p>
        </div>
      )}
      <dl className="grid gap-3 md:grid-cols-2">
        <Linha rotulo="Diagnóstico">{saida.diagnostico}</Linha>
        <Linha rotulo="Resumo">{saida.resumo}</Linha>
        <Linha rotulo="Etapa">{ROTULO_ETAPA_VENDAS[saida.etapa]}</Linha>
        <Linha rotulo="Próximo follow-up">
          {saida.proximo_followup ? formatData(saida.proximo_followup) : 'Sem data'}
        </Linha>
        <Linha rotulo="Ângulo">{ROTULO_ANGULO[saida.angulo]}</Linha>
        <Linha rotulo="Motivo">{saida.motivo}</Linha>
      </dl>
    </div>
  );
}
