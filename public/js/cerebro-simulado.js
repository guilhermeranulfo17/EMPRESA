// Cérebro simulado: gera falas plausíveis por setor, sem chamar nenhuma IA.
// Serve para ver o escritório funcionando na hora e como reserva quando a API falha.

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

const BANCO = {
  comercial: {
    status: ['Ligando para leads da semana', 'Atualizando o CRM', 'Montando proposta para cliente grande', 'Revisando o pipeline', 'Em reunião de fechamento', 'Treinando script de objeções'],
    perguntas: [
      { para: 'marketing', texto: 'Os leads do webinar chegaram bem mais quentes que os do anúncio. Dá para repetir o formato este mês?' },
      { para: 'suporte', texto: 'Quais são as três dúvidas mais comuns de quem acabou de assinar? Quero responder isso já no pitch.' },
      { para: 'financeiro', texto: 'Consigo oferecer 10% de desconto no plano anual sem apertar a margem?' },
      { para: 'marketing', texto: 'Preciso de um estudo de caso curto de cliente do varejo. Os leads desse segmento sempre pedem prova.' },
      { para: 'suporte', texto: 'Tem algum cliente muito satisfeito que toparia gravar um depoimento? Ajudaria a fechar dois negócios travados.' },
      { para: 'financeiro', texto: 'Quanto tempo o cliente médio leva para pagar o valor do CAC? Quero priorizar os perfis que se pagam mais rápido.' },
    ],
    ideias: [
      { titulo: 'Programa de indicação', descricao: 'Cliente que indicar outro cliente ganha um mês grátis. Suporte aponta os clientes mais satisfeitos, Marketing cria a campanha e Financeiro limita o custo por indicação.' },
      { titulo: 'Plano anual com bônus de implantação', descricao: 'Oferecer implantação assistida grátis para quem fecha plano anual. Aumenta o caixa antecipado e reduz cancelamento no primeiro mês.' },
      { titulo: 'Upsell guiado pelo uso', descricao: 'Quando um cliente bate 80% do limite do plano, o Suporte avisa e o Comercial oferece o plano acima com condição especial.' },
    ],
    respostas: ['Do lado comercial, consigo testar isso com 20 leads ainda esta semana.', 'Isso vira argumento de venda direto. Vou colocar no script de hoje.', 'Faz sentido. Trago na reunião de pipeline de sexta quantos negócios isso afeta.', 'Boa! Vou cruzar com o CRM e te passo os números até amanhã.'],
    apoios: ['Apoio. Isso me dá um motivo novo para voltar a falar com leads parados.', 'Vendo isso fácil, os clientes já pediram algo parecido.', 'Apoio. Dá para medir o impacto no fechamento em duas semanas.'],
    questionamentos: ['Gosto, mas o time comercial consegue absorver sem perder foco na meta do mês?', 'Como isso aparece na proposta? Se complicar a oferta, o fechamento cai.'],
    ceo: ['Entendido! Vou alinhar o time comercial e trago os números aqui na caixa.', 'Recebido. Já estou ajustando o pipeline para isso.', 'Pode deixar. Vou puxar Marketing e Financeiro para fecharmos um plano.'],
  },
  marketing: {
    status: ['Planejando o calendário de conteúdo', 'Ajustando campanha de anúncios', 'Analisando CPL da semana', 'Gravando roteiro de vídeo', 'Revisando a landing page', 'Estudando concorrentes'],
    perguntas: [
      { para: 'comercial', texto: 'Qual objeção vocês mais ouviram esta semana? Quero criar um conteúdo que responda antes da reunião.' },
      { para: 'suporte', texto: 'Me mandem as perguntas repetidas dos chamados. Viram uma série de posts "como fazer" que atrai lead bom.' },
      { para: 'financeiro', texto: 'Se o CPL cair 15% este mês, posso reinvestir a sobra em teste de vídeo curto?' },
      { para: 'comercial', texto: 'Os leads de indicação convertem melhor que os de anúncio? Se sim, quero mudar a verba.' },
      { para: 'suporte', texto: 'Quais clientes usam o produto de um jeito criativo? Quero contar essas histórias.' },
      { para: 'financeiro', texto: 'Qual é o CAC máximo aceitável por plano? Assim corto campanha sem precisar perguntar toda vez.' },
    ],
    ideias: [
      { titulo: 'Central de ajuda que vira conteúdo', descricao: 'Transformar as 20 dúvidas mais comuns do Suporte em artigos e vídeos curtos. Reduz chamados e atrai tráfego orgânico com intenção de compra.' },
      { titulo: 'Webinar mensal com cliente convidado', descricao: 'Um cliente real mostra resultados ao vivo. Comercial convida os leads mornos e faz follow-up no dia seguinte.' },
      { titulo: 'Painel único de funil', descricao: 'Um painel com lead, reunião, venda, ativação e cancelamento lado a lado, para os quatro setores enxergarem onde o funil vaza.' },
    ],
    respostas: ['Ótimo insumo! Vou transformar isso em conteúdo esta semana.', 'Anotado. Ajusto a segmentação das campanhas com base nisso.', 'Consigo uma peça de teste em dois dias e mostro o resultado aqui.', 'Isso muda o briefing. Vou reescrever a landing page com essa linguagem.'],
    apoios: ['Apoio! Rende pelo menos um mês de conteúdo.', 'Apoio. Isso melhora a qualidade dos leads, não só a quantidade.', 'Apoio. Consigo divulgar sem gastar verba extra.'],
    questionamentos: ['Qual é a mensagem principal? Sem uma promessa clara, a campanha não para em pé.', 'Como vamos medir isso? Preciso de uma métrica antes de colocar verba.'],
    ceo: ['Recebido! Vou ajustar o plano de marketing e compartilho aqui.', 'Entendido. Já estou revendo campanhas e conteúdo com esse foco.', 'Pode deixar. Monto uma proposta com Comercial ainda hoje.'],
  },
  suporte: {
    status: ['Respondendo chamados', 'Atualizando a base de conhecimento', 'Ligando para cliente em risco', 'Revisando a saúde da carteira', 'Fazendo onboarding de cliente novo', 'Classificando chamados da semana'],
    perguntas: [
      { para: 'comercial', texto: 'Alguns clientes chegam esperando uma função que não temos. Dá para deixar isso claro na venda?' },
      { para: 'marketing', texto: 'Três clientes elogiaram o tutorial em vídeo. Conseguem fazer mais desses para o onboarding?' },
      { para: 'financeiro', texto: 'Posso oferecer um mês de desconto para segurar um cliente que ameaça cancelar?' },
      { para: 'comercial', texto: 'Os clientes que vêm pelo plano anual abrem metade dos chamados. Vale priorizar esse plano?' },
      { para: 'marketing', texto: 'O e-mail de boas-vindas está gerando dúvidas sobre o login. Podemos revisar juntos?' },
      { para: 'financeiro', texto: 'Vários chamados são de boleto vencido. Tem como mandar lembrete antes do vencimento?' },
    ],
    ideias: [
      { titulo: 'Alerta de risco de cancelamento', descricao: 'Cliente que fica 10 dias sem usar o produto gera um alerta. O Suporte liga, entende o motivo e oferece ajuda antes do pedido de cancelamento.' },
      { titulo: 'Onboarding em 3 encontros', descricao: 'Toda conta nova recebe três encontros curtos na primeira semana. Clientes bem implantados cancelam muito menos.' },
      { titulo: 'Pesquisa de 1 pergunta pós-chamado', descricao: 'Depois de cada chamado, uma pergunta: "De 0 a 10, quanto nos recomendaria?". As notas altas viram pedidos de indicação para o Comercial.' },
    ],
    respostas: ['Consigo levantar isso nos chamados e respondo até o fim do dia.', 'Boa! Isso reduziria bastante o volume de chamados repetidos.', 'Vou falar com os clientes da carteira e te trago o retorno.', 'Faz sentido. Já vi esse padrão umas cinco vezes esta semana.'],
    apoios: ['Apoio! Os clientes pedem isso nos chamados o tempo todo.', 'Apoio. Isso deve reduzir cancelamento no primeiro mês.', 'Apoio, e o Suporte ajuda a testar com a carteira.'],
    questionamentos: ['Quem atende o cliente quando isso gerar dúvida? O volume do Suporte já está alto.', 'Precisamos combinar o que foi prometido, senão vira chamado de reclamação depois.'],
    ceo: ['Entendido! Vou olhar os chamados com esse foco e trago um resumo.', 'Recebido. O Suporte já está nisso.', 'Pode deixar. Converso com a carteira e volto com o que os clientes dizem.'],
  },
  financeiro: {
    status: ['Fechando o fluxo de caixa', 'Conciliando recebimentos', 'Cobrando inadimplentes', 'Projetando receita do trimestre', 'Analisando margem por plano', 'Revisando contratos de fornecedores'],
    perguntas: [
      { para: 'comercial', texto: 'O ticket médio caiu 4% no mês. Os descontos estão saindo acima do combinado?' },
      { para: 'marketing', texto: 'Qual campanha trouxe o menor CAC no trimestre? Quero proteger essa verba no orçamento.' },
      { para: 'suporte', texto: 'Qual é o principal motivo de cancelamento este mês? Cada ponto de churn pesa na projeção.' },
      { para: 'comercial', texto: 'Quantos contratos anuais vocês preveem fechar este mês? Preciso disso para o caixa.' },
      { para: 'marketing', texto: 'A verba de anúncio está 12% acima do previsto. Onde dá para cortar sem perder lead bom?' },
      { para: 'suporte', texto: 'A inadimplência subiu em clientes com menos de 3 meses. Vocês percebem alguma dificuldade no início?' },
    ],
    ideias: [
      { titulo: 'Desconto por pagamento no cartão recorrente', descricao: 'Dar 5% de desconto para quem migrar do boleto para cartão recorrente. Reduz inadimplência e custo de cobrança.' },
      { titulo: 'Meta de payback por canal', descricao: 'Cada canal de aquisição ganha uma meta de payback de até 6 meses. Marketing e Comercial ajustam a verba com base nela todo mês.' },
      { titulo: 'Reserva para testes de crescimento', descricao: 'Separar 5% da receita mensal para testar ideias deste escritório, com regra clara: o teste que não mostrar resultado em 30 dias é encerrado.' },
    ],
    respostas: ['Rodo os números hoje e te digo se cabe no orçamento.', 'Faz sentido, desde que o payback fique abaixo de 6 meses.', 'Vou simular três cenários e compartilho aqui.', 'Ok. Me passa o custo estimado que eu calculo o impacto no caixa.'],
    apoios: ['Apoio. O custo é baixo e dá para medir o retorno rápido.', 'Apoio, com limite de orçamento e revisão em 30 dias.', 'Apoio. Isso melhora a previsibilidade do caixa.'],
    questionamentos: ['Antes de aprovar: qual é o custo e em quanto tempo isso se paga?', 'Precisamos de um teto de gasto. Sem isso, não consigo recomendar.', 'Qual métrica prova que funcionou? Sem ela, vira custo fixo escondido.'],
    ceo: ['Entendido! Vou calcular o impacto financeiro e trago aqui.', 'Recebido. Preparo os números para decidirmos com segurança.', 'Pode deixar. Verifico caixa e margem e retorno ainda hoje.'],
  },
};

const GENERICO = {
  status: ['Organizando as tarefas do dia', 'Revisando indicadores do setor', 'Documentando processos', 'Em reunião rápida com o time'],
  perguntas: [
    { para: 'todos', texto: 'Qual processo entre os setores mais atrasa o trabalho de vocês hoje?' },
    { para: 'todos', texto: 'Alguém tem um dado recente de cliente que eu deveria olhar esta semana?' },
  ],
  ideias: [{ titulo: 'Reunião semanal de 15 minutos entre setores', descricao: 'Cada setor traz um número e um bloqueio. Resolve atrito cedo e gera ideias novas.' }],
  respostas: ['Boa, vou considerar isso no meu planejamento.', 'Faz sentido. Te trago um retorno em breve.'],
  apoios: ['Apoio. Parece simples de testar.'],
  questionamentos: ['Quem seria o responsável por isso no dia a dia?'],
  ceo: ['Entendido! Vou trabalhar nisso e trago um retorno.'],
};

const PROXIMOS_PASSOS = [
  'Proposta aprovada! Próximos passos: esta semana fecho o escopo com os setores envolvidos, e em 30 dias trazemos o primeiro resultado aqui.',
  'Que bom! Vou montar um piloto pequeno, combinar responsáveis em cada setor e reportar o andamento toda sexta.',
  'Aprovado! Começo com um teste controlado, e o Financeiro acompanha o custo desde o primeiro dia.',
];

export class CerebroSimulado {
  constructor() {
    this.nome = 'simulação';
    this.usadas = new Set();
  }

  async decidir(ctx) {
    const banco = BANCO[ctx.setor.id] ?? GENERICO;
    const status = sortear(banco.status);
    const pend = ctx.pendencia;

    if (pend) {
      if (pend.tipo === 'ideia' && pend.ideiaId) return this.votar(ctx, banco, status, pend.ideiaId);
      if (pend.tipo === 'decisao') return { acao: 'mensagem', para: 'todos', texto: sortear(PROXIMOS_PASSOS), status: 'Planejando a execução da ideia aprovada' };
      if (pend.de === 'ceo') return { acao: 'mensagem', para: 'ceo', texto: sortear(banco.ceo), status };
      const autor = ctx.nomeDe(pend.de);
      if (pend.tipo === 'voto') {
        return { acao: 'mensagem', para: pend.de, texto: `${autor}, boa pergunta. ${sortear(['Proponho começar com um piloto pequeno e medir em 30 dias.', 'Estimo custo baixo; detalho os números na próxima rodada.', 'Posso ajustar a proposta para caber nessa preocupação.'])}`, status };
      }
      return { acao: 'mensagem', para: pend.de, texto: `${autor}, ${minuscula(sortear(banco.respostas))}`, status };
    }

    const emDiscussao = ctx.ideias.filter((i) => i.status === 'em discussão' && !i.apoios.includes(ctx.agente.id) && !i.comentarios.some((c) => c.agente === ctx.agente.id));
    const sorteio = Math.random();
    if (emDiscussao.length && sorteio < 0.35) return this.votar(ctx, banco, status, sortear(emDiscussao).id);

    const ideiasLivres = banco.ideias.filter((i) => !this.usadas.has(i.titulo) && !ctx.ideias.some((x) => x.titulo === i.titulo));
    if (ideiasLivres.length && sorteio < 0.5) {
      const ideia = sortear(ideiasLivres);
      this.usadas.add(ideia.titulo);
      return { acao: 'ideia', ideia_titulo: ideia.titulo, texto: ideia.descricao, para: 'todos', status: 'Escrevendo uma proposta para a empresa' };
    }

    const setoresExistentes = new Set(ctx.setores.map((s) => s.id));
    const perguntas = banco.perguntas.filter((p) => p.para === 'todos' || (setoresExistentes.has(p.para) && p.para !== ctx.setor.id));
    const pergunta = sortear(perguntas.length ? perguntas : GENERICO.perguntas);
    // às vezes fala direto com um colega do setor em vez do setor inteiro
    const colegas = ctx.colegas.filter((c) => c.setor === pergunta.para);
    const para = colegas.length && Math.random() < 0.5 ? sortear(colegas).id : pergunta.para;
    return { acao: 'mensagem', para, texto: pergunta.texto, status };
  }

  votar(ctx, banco, status, ideiaId) {
    const chanceQuestionar = ctx.setor.id === 'financeiro' ? 0.45 : 0.2;
    const questionar = Math.random() < chanceQuestionar;
    return {
      acao: 'votar',
      ideia_id: ideiaId,
      voto: questionar ? 'questionar' : 'apoiar',
      texto: sortear(questionar ? banco.questionamentos : banco.apoios),
      status,
    };
  }
}

function minuscula(texto) {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}
