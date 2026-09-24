// Cérebro simulado: gera falas plausíveis por setor, sem chamar nenhuma IA.
// Serve para ver o escritório funcionando na hora e como reserva quando a API falha.

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

const BANCO = {
  comercial: {
    status: ['Montando lista de buffets móveis', 'Revisando conversas da IA vendedora', 'Preparando apresentação do sistema', 'Atualizando o funil da semana', 'Testando nova mensagem fria', 'Contando quanto falta para a meta do mês'],
    perguntas: [
      { para: 'marketing', texto: 'Quando o buffet recebe nossa mensagem fria, ele vai olhar o nosso Instagram. O perfil já mostra o orçamento interativo funcionando?' },
      { para: 'financeiro', texto: 'Para bater 5 vendas no mês, quantas apresentações vocês acham que precisamos fazer? Quero montar a meta por semana.' },
      { para: 'suporte', texto: 'Quando fecharmos os primeiros buffets, em quanto tempo conseguimos deixar o orçamento interativo deles no ar? Quero prometer isso na venda.' },
      { para: 'marketing', texto: 'Preciso de um vídeo curto de 30 segundos mostrando um orçamento sendo montado. A IA vendedora pode mandar isso no meio da conversa.' },
      { para: 'financeiro', texto: 'Posso oferecer o primeiro mês com desconto para quem fechar ainda esta semana, ou isso atrapalha a meta de MRR?' },
      { para: 'suporte', texto: 'Qual informação do buffet vocês precisam para a implantação? Já peço tudo no fechamento para ninguém esperar.' },
    ],
    ideias: [
      { titulo: 'Oferta de apresentação de 15 minutos', descricao: 'Quando o buffet hesitar na conversa com a IA, ela oferece uma apresentação curta de 15 minutos com a Júlia. Medimos quantas apresentações viram venda.' },
      { titulo: 'Cadência de 3 toques no WhatsApp', descricao: 'Mensagem de abertura, um vídeo do orçamento interativo dois dias depois e um último contato com prazo. Comercial escreve, Marketing grava o vídeo, e medimos a taxa de resposta de cada toque.' },
      { titulo: 'Lista de buffets por região', descricao: 'Começar a prospecção por uma região de cada vez, para gerar conversas e depois indicações entre buffets que se conhecem. Nina mapeia, Bianca prospecta.' },
    ],
    respostas: ['Do lado comercial, consigo testar isso na prospecção desta semana.', 'Isso vira argumento na conversa da IA. Vou ajustar o roteiro hoje.', 'Faz sentido. Trago no fim da semana o impacto disso no funil.', 'Boa! Vou separar os buffets que responderam e testar com eles primeiro.'],
    apoios: ['Apoio. Isso ajuda direto a meta de 5 vendas por mês.', 'Apoio, os buffets vão entender mais rápido o valor do orçamento interativo.', 'Apoio. Dá para medir no funil em duas semanas.'],
    questionamentos: ['Gosto, mas isso não tira tempo da prospecção? A meta de 5 vendas depende de volume de conversas.', 'Como a IA vendedora explica isso para o buffet sem complicar a conversa?'],
    ceo: ['Entendido! Vou alinhar o time comercial e trago o plano aqui na caixa.', 'Recebido. Já estou ajustando a prospecção e o roteiro da IA para isso.', 'Pode deixar. Vou puxar Marketing e Financeiro para fecharmos um plano.'],
  },
  marketing: {
    status: ['Gravando vídeo do orçamento interativo', 'Ajustando a bio do Instagram', 'Escrevendo a promessa principal', 'Pesquisando grupos de buffets', 'Mapeando fornecedores de festa', 'Planejando posts da semana'],
    perguntas: [
      { para: 'comercial', texto: 'Qual frase da IA vendedora mais faz o buffet responder? Quero usar a mesma linguagem nos posts.' },
      { para: 'suporte', texto: 'Quando tivermos o primeiro cliente usando, podemos gravar a tela do orçamento dele? Um caso real vale mais que qualquer anúncio.' },
      { para: 'financeiro', texto: 'Temos verba para testar um anúncio pequeno para buffets, ou seguimos só com prospecção fria e conteúdo por enquanto?' },
      { para: 'comercial', texto: 'Buffet móvel costuma perguntar primeiro sobre preço ou sobre como funciona? Isso muda o roteiro do vídeo.' },
      { para: 'suporte', texto: 'Quais partes do sistema os clientes novos acham mais fáceis? Quero destacar isso no conteúdo.' },
      { para: 'financeiro', texto: 'Uma parceria com fornecedor de festa que indique buffets pode ganhar comissão? Qual valor faz sentido com o plano de R$ 347?' },
    ],
    ideias: [
      { titulo: 'Perfil do Instagram como vitrine', descricao: 'Deixar no perfil da Orkestra 3 vídeos fixos mostrando um orçamento interativo sendo montado. Todo buffet que recebe mensagem fria vai olhar o perfil antes de responder.' },
      { titulo: 'Parceria com fornecedores de festa', descricao: 'Fornecedores de decoração, bebidas e locação falam com buffets todo dia. Oferecer uma comissão por indicação que vire cliente. Nina fecha as parcerias e o Financeiro define o valor.' },
      { titulo: 'Página de demonstração do orçamento', descricao: 'Um link com um orçamento interativo de exemplo que a IA vendedora manda no WhatsApp, para o buffet testar como o cliente dele veria.' },
    ],
    respostas: ['Ótimo insumo! Vou transformar isso em conteúdo esta semana.', 'Anotado. Ajusto a mensagem principal com base nisso.', 'Consigo um vídeo de teste em dois dias e mostro aqui.', 'Isso muda o roteiro. Vou reescrever usando as palavras que os buffets usam.'],
    apoios: ['Apoio! Isso dá prova para o buffet confiar na gente.', 'Apoio. Melhora a qualidade das conversas, não só a quantidade.', 'Apoio. Consigo fazer sem gastar verba.'],
    questionamentos: ['Qual é a promessa principal? Sem uma frase clara, o buffet não entende o valor.', 'Como vamos medir isso? Preciso saber se trouxe conversa ou venda.'],
    ceo: ['Recebido! Vou ajustar o plano de marketing e compartilho aqui.', 'Entendido. Já estou revendo conteúdo e mensagem com esse foco.', 'Pode deixar. Monto uma proposta com o Comercial ainda hoje.'],
  },
  suporte: {
    status: ['Preparando o roteiro de implantação', 'Montando checklist do cliente novo', 'Escrevendo tutorial do orçamento', 'Organizando modelos de cardápio', 'Planejando acompanhamento dos primeiros clientes', 'Revisando perguntas que podem surgir'],
    perguntas: [
      { para: 'comercial', texto: 'O que a IA vendedora está prometendo sobre a implantação? Quero garantir que a gente cumpra exatamente isso.' },
      { para: 'marketing', texto: 'Podemos fazer um vídeo de boas-vindas curto para o cliente novo? Ajuda o buffet a configurar sozinho os primeiros pacotes.' },
      { para: 'financeiro', texto: 'A cobrança começa no dia da venda ou quando o orçamento do buffet entra no ar? Preciso explicar isso no onboarding.' },
      { para: 'comercial', texto: 'Na apresentação, os buffets perguntam sobre cardápios com muitas opções? Quero ter um modelo pronto.' },
      { para: 'marketing', texto: 'Quando o primeiro cliente fechar uma festa pelo orçamento interativo, vocês querem essa história para um post?' },
      { para: 'financeiro', texto: 'Se um cliente novo pedir para pausar no mês sem festas, qual regra seguimos?' },
    ],
    ideias: [
      { titulo: 'Implantação em 48 horas', descricao: 'Todo cliente novo tem o orçamento interativo no ar em até 48 horas depois da venda. Duda configura cardápios e pacotes junto com o buffet por WhatsApp.' },
      { titulo: 'Check-in na primeira festa', descricao: 'Otto fala com o cliente logo depois do primeiro orçamento fechado pelo sistema, pede um depoimento e pergunta se conhece outro buffet que se beneficiaria.' },
      { titulo: 'Modelos prontos de cardápio', descricao: 'Ter 3 modelos de orçamento prontos para os tipos mais comuns de buffet móvel. O cliente só ajusta preços e itens, e a implantação fica mais rápida.' },
    ],
    respostas: ['Consigo preparar isso no processo de implantação até o fim do dia.', 'Boa! Isso deixa o começo do cliente bem mais tranquilo.', 'Vou incluir no checklist de onboarding e te aviso.', 'Faz sentido. Anoto para acompanhar com os primeiros clientes.'],
    apoios: ['Apoio! Cliente que começa bem não cancela.', 'Apoio. Isso gera os primeiros casos de sucesso que o Marketing precisa.', 'Apoio, e o Suporte ajuda a testar com os primeiros clientes.'],
    questionamentos: ['Quem atende o cliente se isso gerar dúvida? Somos só dois no Suporte.', 'Precisamos combinar o que foi prometido na venda, senão vira frustração depois.'],
    ceo: ['Entendido! Vou preparar o Suporte para isso e trago um resumo.', 'Recebido. O time de Suporte & Sucesso já está nisso.', 'Pode deixar. Vejo o que muda na implantação e volto aqui.'],
  },
  financeiro: {
    status: ['Atualizando o painel de MRR', 'Calculando quanto falta para a meta', 'Revisando a cobrança recorrente', 'Projetando o caixa do trimestre', 'Estimando custo por cliente', 'Conferindo recebimentos do mês'],
    perguntas: [
      { para: 'comercial', texto: 'A meta é R$ 5.000 de MRR: cerca de 15 clientes a R$ 347. Como está o funil para as 5 vendas deste mês?' },
      { para: 'marketing', texto: 'Se testarmos anúncio, qual é o máximo que podemos pagar por cliente? Pela minha conta, até uns R$ 347 se paga no primeiro mês.' },
      { para: 'suporte', texto: 'Cada cancelamento no começo pesa muito na meta. Como vamos acompanhar os primeiros clientes de perto?' },
      { para: 'comercial', texto: 'Desconto no primeiro mês ajuda a fechar, mas atrasa o MRR. Podemos combinar um limite para isso?' },
      { para: 'marketing', texto: 'Quanto custaria produzir os vídeos do orçamento interativo? Quero reservar no caixa.' },
      { para: 'suporte', texto: 'A cobrança do cliente novo deve começar quando o orçamento dele entrar no ar? Precisamos alinhar isso com o Comercial.' },
    ],
    ideias: [
      { titulo: 'Painel semanal da meta', descricao: 'Toda segunda, um resumo na caixa com MRR atual, vendas da semana, quanto falta para os R$ 5.000 e o ritmo necessário. Bruno monta, todos os setores usam.' },
      { titulo: 'Plano anual com desconto', descricao: 'Oferecer o plano anual com desconto para buffets que já estão convencidos. Entra caixa antecipado e diminui o risco de cancelamento.' },
      { titulo: 'Cobrança automática no cartão', descricao: 'Começar todos os clientes na cobrança recorrente no cartão, para evitar atraso e não gastar tempo cobrando um por um.' },
    ],
    respostas: ['Faço as contas hoje e digo se cabe no caixa.', 'Faz sentido, desde que se pague em poucos meses.', 'Vou simular três cenários para a meta e compartilho aqui.', 'Ok. Me passa o custo estimado que eu calculo o impacto.'],
    apoios: ['Apoio. O custo é baixo e dá para medir rápido.', 'Apoio, com limite de gasto e revisão em 30 dias.', 'Apoio. Isso ajuda a bater a meta de MRR.'],
    questionamentos: ['Antes de aprovar: quanto custa e em quanto tempo se paga?', 'Precisamos de um teto de gasto. Sem isso, não consigo recomendar.', 'Como saberemos que funcionou? Sem uma métrica, vira custo escondido.'],
    ceo: ['Entendido! Vou calcular o impacto na meta e trago aqui.', 'Recebido. Preparo os números para decidirmos com segurança.', 'Pode deixar. Confiro caixa e meta de MRR e retorno ainda hoje.'],
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
