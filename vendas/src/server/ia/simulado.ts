import 'server-only';
import type { PedidoIa, RespostaIa } from './tipos';

/**
 * Provedor de teste (VENDAS_IA_PROVEDOR=simulado): resposta fixa e válida, sem chamar nenhuma
 * IA. Serve para os testes automáticos e para ver as telas sem chave. O texto avisa que é
 * simulado para nunca ser confundido com uma resposta de verdade.
 */
export async function gerarSimulado(pedido: PedidoIa): Promise<RespostaIa> {
  const entrada = pedido.usuario.split('# Conversa do WhatsApp colada agora').pop() ?? '';
  const hoje = pedido.usuario.match(/Hoje é (\d{4}-\d{2}-\d{2})/)?.[1];
  const pediuParar = /(\bpare\b|\bparar\b|não quero|nao quero|sair da lista)/i.test(entrada);
  const emDoisDias = hoje
    ? new Date(Date.parse(`${hoje}T12:00:00Z`) + 2 * 86_400_000).toISOString().slice(0, 10)
    : '';
  return {
    ok: true,
    provedor: 'simulado',
    modelo: 'simulado',
    texto: JSON.stringify({
      resumo: pediuParar
        ? '(simulado) O lead pediu para não receber mais mensagens.'
        : '(simulado) O lead respondeu e quer saber como funciona.',
      etapa: pediuParar ? 'sem_interesse' : 'respondeu',
      mensagem: pediuParar
        ? '(simulado) Tudo bem, não te mando mais mensagem. Obrigado!'
        : '(simulado) Fica em torno de R$ 250 por mês. Quer que eu te mande o link para ver como fica?',
      proximo_followup: pediuParar ? '' : emDoisDias,
      motivo: '(simulado) Resposta de teste.',
      nao_contatar: pediuParar,
    }),
  };
}
