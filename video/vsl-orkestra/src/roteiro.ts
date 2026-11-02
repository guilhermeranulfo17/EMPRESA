/*
 * Roteiro da VSL (estrutura Alex Hormozi): gancho → agitação → virada → mecanismo → oferta →
 * chamada. O texto é o mesmo enviado à ElevenLabs (video/roteiros/vsl-orkestra.md). Cada cena é
 * um parágrafo; cada frase vira uma legenda.
 */
export type CenaRoteiro = { id: string; frases: string[] };

export const ROTEIRO: CenaRoteiro[] = [
  {
    id: 'gancho',
    frases: [
      'Dono de buffet: quantas vezes hoje você já respondeu a mesma pergunta no WhatsApp?',
      'Quanto fica pra sessenta pessoas?',
      'E no sábado?',
      'E com a mesa temática?',
    ],
  },
  {
    id: 'agitacao',
    frases: [
      'Cada resposta é uma conta feita na mão.',
      'Enquanto você calcula, o cliente pergunta em outro buffet.',
      'A proposta enviada fica sem retorno.',
      'E a data, o contrato e o sinal ficam espalhados entre o caderno, uma pasta e o extrato do banco.',
    ],
  },
  {
    id: 'virada',
    frases: [
      'O problema não é falta de cliente.',
      'É não ter um caminho do orçamento até a festa fechada.',
    ],
  },
  {
    id: 'orcamento',
    frases: [
      'Com o Orkestra, o seu cliente monta o orçamento sozinho, no link do seu buffet.',
      'Ele escolhe a data, os convidados e o pacote, e vê o valor calculado com as suas regras: dia da semana, turno, idade das crianças e adicionais.',
    ],
  },
  {
    id: 'negociacao',
    frases: [
      'Você recebe o contato com tudo o que ele escolheu.',
      'Manda a proposta com a sua marca e vê quando ela foi aberta.',
      'O Orkestra mostra quem chamar e deixa a mensagem pronta.',
      'Quem envia é você.',
    ],
  },
  {
    id: 'fechamento',
    frases: [
      'Quando o cliente decide, a pré-reserva segura a data com prazo, o contrato sai do orçamento aceito, e cada parcela da festa fica anotada.',
      'Você sabe exatamente quanto falta receber.',
    ],
  },
  {
    id: 'oferta',
    frases: [
      'Você pode testar tudo isso por catorze dias, de graça e sem cartão.',
      'Gostou, escolhe o plano.',
      'Não gostou, cancela quando quiser.',
    ],
  },
  {
    id: 'chamada',
    frases: ['Clique em testar grátis e coloque os seus pacotes no link hoje.'],
  },
];
