import 'server-only';
import type { PedidoIa, RespostaIa } from './tipos';

/**
 * Provedor de teste (VENDAS_IA_PROVEDOR=simulado): resposta fixa e válida, sem chamar
 * nenhuma IA. Serve para os testes automáticos e para ver as telas sem chave. A mensagem
 * avisa que é simulada para nunca ser confundida com uma resposta de verdade.
 */
export async function gerarSimulado(pedido: PedidoIa): Promise<RespostaIa> {
  const entrada = pedido.usuario.split('# O que o Gui colou agora').pop() ?? '';
  const pediuParar = /(\bpare\b|\bparar\b|não quero|nao quero|sair da lista)/i.test(entrada);
  const abordagem = entrada.includes('primeira abordagem');
  const followup = entrada.includes('não respondeu desde a última mensagem');
  if (abordagem || followup) {
    return {
      ok: true,
      provedor: 'simulado',
      modelo: 'simulado',
      texto: JSON.stringify({
        diagnostico: abordagem
          ? '(simulado) Lead novo, ainda sem contato.'
          : '(simulado) Lead sem responder, hora do follow-up.',
        mensagem: abordagem
          ? '(simulado) Oi! Vi o buffet de vocês e fiquei curioso — como fazem os orçamentos hoje?'
          : '(simulado) Passando rapidinho pra lembrar da minha mensagem. Faz sentido conversar?',
        etapa: 'abordado',
        resumo: abordagem
          ? '(simulado) Abordado pela primeira vez.'
          : '(simulado) Follow-up enviado.',
        proximo_followup: '',
        angulo: abordagem ? 'abertura' : 'lembrete',
        passar_para_humano: false,
        nao_contatar: false,
        motivo: '(simulado) Mensagem gerada pela fila.',
      }),
    };
  }
  return {
    ok: true,
    provedor: 'simulado',
    modelo: 'simulado',
    texto: JSON.stringify({
      diagnostico: '(simulado) Lead respondeu e quer entender como funciona.',
      mensagem: pediuParar
        ? '(simulado) Tudo bem, não te mando mais mensagem. Obrigado pela atenção!'
        : '(simulado) Que bom que respondeu! Hoje vocês fazem os orçamentos pelo WhatsApp mesmo?',
      etapa: pediuParar ? 'perdido' : 'respondeu',
      resumo: '(simulado) Respondeu a abordagem.',
      proximo_followup: '',
      angulo: 'resposta',
      passar_para_humano: false,
      nao_contatar: pediuParar,
      motivo: '(simulado) Resposta de teste.',
    }),
  };
}
