// Entregas: materiais prontos para usar, escritos por um agente com o Claude.

import { descreverEmpresa, descreverDados, descreverEntregas } from './prompts.js';

export const MODELOS = [
  {
    id: 'prospeccao',
    titulo: 'Mensagens de prospecção no WhatsApp',
    agente: 'bianca',
    pedido: 'Escreva 3 variações de mensagem fria de abertura para donos de buffet móvel no WhatsApp, e para cada uma um follow-up para o 2º dia e um último contato para o 5º dia. Mensagens curtas, naturais, sem parecer spam, que levem o buffet a responder. Explique em uma linha quando usar cada variação.',
  },
  {
    id: 'roteiro_ia',
    titulo: 'Roteiro da IA vendedora',
    agente: 'tiago',
    pedido: 'Monte o roteiro de conversa da IA que vende no WhatsApp: abertura depois que o buffet responde, perguntas para entender o buffet, como explicar o orçamento interativo em linguagem simples, quando e como oferecer a apresentação, como apresentar o preço de R$ 347 e como pedir o fechamento. Inclua exemplos de frases prontas.',
  },
  {
    id: 'objecoes',
    titulo: 'Respostas para objeções',
    agente: 'tiago',
    pedido: 'Liste as objeções mais prováveis de um dono de buffet móvel (ex.: preço, "já faço orçamento no WhatsApp", "não tenho tempo de configurar", "meus clientes preferem falar comigo") e escreva para cada uma uma resposta curta que a IA vendedora ou a equipe possa usar.',
  },
  {
    id: 'apresentacao',
    titulo: 'Roteiro de apresentação de 15 minutos',
    agente: 'julia',
    pedido: 'Escreva o roteiro de uma apresentação de 15 minutos para um buffet que pediu para ver o sistema: abertura, perguntas iniciais, demonstração do orçamento interativo com um exemplo de festa, perguntas de fechamento e próximo passo. Indique o tempo de cada parte.',
  },
  {
    id: 'plano_semana',
    titulo: 'Plano da semana para a meta',
    agente: 'rafael',
    pedido: 'Monte o plano desta semana para a meta de 5 vendas no mês: quantas mensagens frias, respostas, apresentações e vendas precisamos (mostre a conta, usando os números reais quando existirem e dizendo quando é estimativa) e as tarefas de cada setor, com responsável.',
  },
  {
    id: 'conteudo',
    titulo: 'Posts e vídeos da semana',
    agente: 'caio',
    pedido: 'Sugira 5 posts ou vídeos curtos para o Instagram da Orkestra que deixem um dono de buffet confiante depois de receber a mensagem no WhatsApp. Para cada um: formato, gancho dos primeiros 3 segundos, roteiro curto e legenda.',
  },
  {
    id: 'onboarding',
    titulo: 'Checklist de implantação do cliente',
    agente: 'duda',
    pedido: 'Monte o checklist de implantação de um buffet que acabou de assinar: o que pedir ao cliente, em que ordem configurar o orçamento interativo, mensagens prontas para mandar no WhatsApp em cada etapa e como confirmar que ele está usando.',
  },
  {
    id: 'relatorio_meta',
    titulo: 'Relatório da meta de MRR',
    agente: 'helena',
    pedido: 'Faça o relatório da meta: onde estamos em MRR e clientes (usando os números reais informados), quanto falta para R$ 5.000, o ritmo necessário por semana e os 3 maiores riscos. Se faltar algum número, diga quais o CEO precisa informar.',
  },
  { id: 'outra', titulo: 'Outra entrega', agente: 'rafael', pedido: '' },
];

function montarPrompt({ escritorio, agenteId, titulo, pedido, anterior, ajuste }) {
  const { estado } = escritorio;
  const agente = estado.agentes[agenteId];
  const setor = estado.setores.find((s) => s.id === agente.setor);
  const nomeDe = (id) => escritorio.nomeDe(id);
  const conversa = estado.mensagens
    .slice(-15)
    .map((m) => `- ${nomeDe(m.de)} → ${nomeDe(m.para)}: ${m.texto}`)
    .join('\n');
  const aprovadas = estado.ideias.filter((i) => i.status === 'aprovada').map((i) => `- ${i.titulo}: ${i.descricao}`).join('\n');

  const tarefa = anterior
    ? `Você já entregou a versão abaixo de "${titulo}". O CEO pediu este ajuste: ${ajuste}\n\nVersão anterior:\n${anterior}\n\nReescreva a entrega inteira com o ajuste.`
    : `O CEO pediu esta entrega: "${titulo}".\n${pedido}`;

  return `Você é ${agente.nome}, ${agente.cargo} no setor ${setor.nome} da ${estado.empresa.nome}. ${agente.perfil}

${descreverEmpresa(estado.empresa)}

${descreverDados(estado.dados)}

Ideias aprovadas pelo CEO:
${aprovadas || '(nenhuma ainda)'}

${descreverEntregas(estado.entregas, nomeDe)}

Conversa recente da equipe:
${conversa || '(sem conversa ainda)'}

${tarefa}

Como escrever:
- Em português do Brasil, pronto para o CEO copiar e usar hoje, sem introdução nem despedida.
- Organize com títulos curtos iniciados por "## " e listas com "- ". Use **negrito** só para destacar o essencial.
- Seja específico para buffets móveis e para a Orkestra.
- Não invente resultados como se fossem reais. Use os números reais acima quando existirem; o resto é meta ou estimativa, e diga isso.`;
}

// Gera (ou refaz) uma entrega. `onText` recebe o texto inteiro até agora, para mostrar enquanto é escrito.
export async function gerarEntrega(sample, escritorio, { agenteId, titulo, pedido, anterior, ajuste, signal, onText }) {
  const { text, truncated } = await sample(montarPrompt({ escritorio, agenteId, titulo, pedido, anterior, ajuste }), {
    cache: false,
    signal,
    onText: ({ text }) => onText?.(text),
  });
  return { conteudo: text.trim(), cortada: truncated };
}

// Markdown simples (## títulos, - listas, **negrito**) para nós do DOM, sem innerHTML.
export function renderizarMarkdown(texto) {
  const frag = document.createDocumentFragment();
  let lista = null;
  const inline = (linha) => {
    const p = [];
    linha.split(/(\*\*[^*]+\*\*)/g).forEach((parte) => {
      if (/^\*\*[^*]+\*\*$/.test(parte)) {
        const b = document.createElement('strong');
        b.textContent = parte.slice(2, -2);
        p.push(b);
      } else if (parte) p.push(document.createTextNode(parte));
    });
    return p;
  };
  for (const bruta of texto.split('\n')) {
    const linha = bruta.trimEnd();
    const item = linha.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (item) {
      if (!lista) {
        lista = document.createElement(/^\s*\d/.test(linha) ? 'ol' : 'ul');
        frag.append(lista);
      }
      const li = document.createElement('li');
      li.append(...inline(item[1]));
      lista.append(li);
      continue;
    }
    lista = null;
    if (!linha.trim()) continue;
    const titulo = linha.match(/^#{1,4}\s+(.*)$/);
    const no = document.createElement(titulo ? 'h4' : 'p');
    no.append(...inline(titulo ? titulo[1] : linha));
    frag.append(no);
  }
  return frag;
}
