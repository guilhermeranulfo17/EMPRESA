import { diasEntre } from '@/domain/dates';
import type { Angulo } from './agente';
import { ETAPAS_ENCERRADAS, type EtapaVendas } from './etapas';

/*
 * Fila do dia: quem o Gui precisa chamar hoje. Regras puras (o servidor só busca os leads).
 *  - sugestão esperando decisão vem primeiro;
 *  - depois follow-ups vencidos (o mais atrasado primeiro), os de hoje e os leads novos;
 *  - quem já recebeu 3 mensagens sem responder sai da fila e vai para "encerrar";
 *  - não contatar, cliente e perdido nunca entram.
 */

export const MAX_TENTATIVAS = 3;

export type LeadFila = {
  id: string;
  nome: string;
  buffet: string | null;
  cidade: string | null;
  etapa: EtapaVendas;
  resumo: string | null;
  proximoFollowup: string | null;
  tentativas: number;
  naoContatar: boolean;
  temSugestaoPendente: boolean;
  criadoEm: Date;
};

export type MotivoFila = 'pendente' | 'atrasado' | 'hoje' | 'novo' | 'encerrar';

export type ItemFila = LeadFila & { motivo: MotivoFila; diasAtraso: number };

export function classificar(lead: LeadFila, hoje: string): ItemFila | null {
  if (lead.naoContatar || (ETAPAS_ENCERRADAS as readonly string[]).includes(lead.etapa)) {
    return null;
  }
  const item = (motivo: MotivoFila, diasAtraso = 0): ItemFila => ({ ...lead, motivo, diasAtraso });
  if (lead.temSugestaoPendente) return item('pendente');
  const vencido = lead.proximoFollowup !== null && lead.proximoFollowup <= hoje;
  if (lead.tentativas >= MAX_TENTATIVAS) return vencido ? item('encerrar') : null;
  if (vencido) {
    const atraso = diasEntre(lead.proximoFollowup!, hoje);
    return atraso > 0 ? item('atrasado', atraso) : item('hoje');
  }
  if (lead.etapa === 'novo' && lead.proximoFollowup === null) return item('novo');
  return null;
}

const ORDEM: Record<MotivoFila, number> = {
  pendente: 0,
  atrasado: 1,
  hoje: 2,
  novo: 3,
  encerrar: 4,
};

export function montarFila(leads: LeadFila[], hoje: string): ItemFila[] {
  return leads
    .map((l) => classificar(l, hoje))
    .filter((i): i is ItemFila => i !== null)
    .sort(
      (a, b) =>
        ORDEM[a.motivo] - ORDEM[b.motivo] ||
        b.diasAtraso - a.diasAtraso ||
        a.criadoEm.getTime() - b.criadoEm.getTime(),
    );
}

export const ROTULO_MOTIVO: Record<MotivoFila, string> = {
  pendente: 'Sugestão esperando você',
  atrasado: 'Follow-up atrasado',
  hoje: 'Follow-up hoje',
  novo: 'Novo, ainda não abordado',
  encerrar: `${MAX_TENTATIVAS} tentativas sem resposta`,
};

export function descreverMotivo(item: ItemFila): string {
  if (item.motivo === 'atrasado') {
    return `Follow-up atrasado há ${item.diasAtraso} ${item.diasAtraso === 1 ? 'dia' : 'dias'}`;
  }
  return ROTULO_MOTIVO[item.motivo];
}

/** Tipo de mensagem que o copiloto escreve sem o Gui colar nada. */
export type TipoGerado = 'abordagem' | 'followup';

export function tipoParaGerar(lead: { etapa: EtapaVendas; tentativas: number }): TipoGerado {
  return lead.etapa === 'novo' && lead.tentativas === 0 ? 'abordagem' : 'followup';
}

/**
 * Instrução que vai no lugar da resposta do lead quando o Gui pede a mensagem pela fila.
 * Inclui os ângulos já usados para o follow-up mudar de ângulo.
 */
export function instrucaoGerada(
  tipo: TipoGerado,
  tentativas: number,
  angulosUsados: Angulo[],
): string {
  if (tipo === 'abordagem') {
    return '(O lead ainda não recebeu nenhuma mensagem. Escreva a primeira abordagem: curta, pessoal, uma pergunta só. Ângulo: abertura.)';
  }
  const usados = angulosUsados.length ? angulosUsados.join(', ') : 'nenhum';
  return [
    `(O lead não respondeu desde a última mensagem. Esta é a tentativa ${tentativas + 1} de ${MAX_TENTATIVAS} sem resposta.`,
    `Ângulos já usados nesta conversa: ${usados}. Use um ângulo diferente (lembrete, valor_novo, prova_social ou ultima_chamada).`,
    tentativas + 1 >= MAX_TENTATIVAS
      ? 'É a última tentativa: use ultima_chamada e deixe a porta aberta.)'
      : 'Não repita a mensagem anterior.)',
  ].join(' ');
}

/** Primeiro ângulo de follow-up ainda não usado (para quando o copiloto repete). */
export function proximoAngulo(usados: Angulo[]): Angulo {
  const ordem: Angulo[] = ['lembrete', 'valor_novo', 'prova_social', 'ultima_chamada'];
  return ordem.find((a) => !usados.includes(a)) ?? 'ultima_chamada';
}
