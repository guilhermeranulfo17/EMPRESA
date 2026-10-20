// Cérebro simulado: gera falas plausíveis por setor, sem chamar nenhuma IA.
// Serve para ver o escritório funcionando na hora e como reserva quando a API falha.

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

// Falas sobre o momento real da Orkestra (oferta de validação, leads quentes, Uberlândia, preço, sistema).
// Escritas à mão: não gastam IA. Os agentes sugerem e perguntam; quem executa é o CEO.
const BANCO = {
  comercial: {
    status: ['Revendo a lista de buffets quentes', 'Separando quem pediu proposta', 'Ajustando a mensagem da oferta de validação', 'Conferindo o funil na planilha', 'Priorizando os buffets de Uberlândia', 'Preparando o roteiro do follow-up'],
    perguntas: [
      { para: 'marketing', texto: 'Para os 22 buffets que já conversaram com a gente, a mensagem nova precisa explicar a oferta em duas linhas: catálogo montado de graça e link na bio por 14 dias. Me ajuda a enxugar?' },
      { para: 'financeiro', texto: 'Se um buffet aceitar o teste hoje, o preço de fundador do dia 14 já está decidido? Não quero improvisar o valor na conversa.' },
      { para: 'suporte', texto: 'Quantos catálogos a gente consegue montar por semana sem atrasar ninguém? Preciso saber antes de oferecer o teste para mais buffets.' },
      { para: 'marketing', texto: 'O Instagram da Orkestra ainda fala em CRM? Quem recebe a nossa mensagem vai olhar o perfil antes de responder.' },
      { para: 'ti', texto: 'O domínio próprio já está no ar? Mandar o link de preview para um buffet desconfiado derruba a conversa.' },
      { para: 'financeiro', texto: 'Quanto vale para um buffet fechar um evento a mais por ano? Quero levar essa conta pronta na conversa.' },
      { para: 'suporte', texto: 'Quando o buffet diz que o preço muda muito, como a gente explica que o catálogo dá conta disso?' },
    ],
    ideias: [
      { titulo: 'Zerar as propostas devidas primeiro', descricao: 'Antes de abordar gente nova, mandar o material para quem pediu e ficou sem resposta. Já são conversas quentes; esquecer delas é o maior desperdício do funil.' },
      { titulo: 'Follow-up com prazo de 48 horas', descricao: 'Toda conversa aberta ganha um próximo passo com data na planilha. Se passar de 48 horas sem retorno, o buffet volta para a pilha do dia.' },
      { titulo: 'Oferecer o teste para os quentes fora de Uberlândia', descricao: 'Catálogo e link na bio funcionam a distância. Os buffets de BH, Goiânia e Fortaleza já conhecem a Orkestra e podem entrar no teste agora.' },
    ],
    respostas: ['Do lado comercial, encaixo isso nas abordagens desta semana.', 'Faz sentido. Vou sugerir ao CEO colocar isso na planilha como próximo passo.', 'Boa, isso vira argumento na conversa com o dono do buffet.', 'Anotado. Ajusto a mensagem da oferta com isso.'],
    apoios: ['Apoio. Isso coloca mais buffets no teste de 14 dias.', 'Apoio, ataca direto o follow-up que ficou parado.', 'Apoio. Dá para medir na planilha em uma semana.'],
    questionamentos: ['Gosto, mas isso não tira tempo das conversas com os buffets quentes?', 'Como isso aparece para o dono do buffet sem complicar a oferta?'],
    ceo: ['Entendido. Sugiro marcar isso como próximo passo na planilha.', 'Recebido. Vou propor a ordem das abordagens por prioridade.', 'Combinado. Trago a lista de quem falar primeiro.'],
  },
  marketing: {
    status: ['Reescrevendo a bio do Instagram', 'Roteirizando o vídeo de 60 segundos', 'Revisando a frase principal', 'Montando o post do buffet demo', 'Separando prints do orçamento no celular', 'Pesquisando como os buffets mostram preço'],
    perguntas: [
      { para: 'comercial', texto: 'Qual objeção os buffets mais repetiram: preço aberto, preço que muda ou já respondo rápido? Quero responder isso em conteúdo.' },
      { para: 'suporte', texto: 'Quando o primeiro buffet colocar o link na bio, posso gravar a tela do orçamento dele? Um caso real vale mais que qualquer post.' },
      { para: 'ti', texto: 'A página demo abre bem no celular? É o principal material de venda e precisa carregar em menos de 3 segundos.' },
      { para: 'financeiro', texto: 'Segura o tráfego pago até a oferta estar validada, certo? Prefiro gastar zero agora e investir quando tiver número real.' },
      { para: 'comercial', texto: 'Posso usar a frase: o cliente monta a festa, vê o preço e cai no seu WhatsApp já qualificado? Testa na próxima conversa e me diz se pegou.' },
    ],
    ideias: [
      { titulo: 'Vídeo de 60 segundos do cliente montando a festa', descricao: 'Gravar a tela do celular montando um orçamento no buffet demo, do link da bio até o WhatsApp. Serve para o Instagram e para mandar na abordagem.' },
      { titulo: 'Trocar CRM por orçamento automático em todo lugar', descricao: 'Logo, bio, destaque e página demo falando a mesma coisa: orçamento automático no link da bio. Quem chega pelo nosso contato precisa entender em 5 segundos.' },
    ],
    respostas: ['Ótimo insumo. Transformo isso em roteiro de conteúdo.', 'Anotado. Ajusto a mensagem principal com base nisso.', 'Isso muda o roteiro do vídeo. Vou usar as palavras que os buffets usam.', 'Boa. Isso entra na bio.'],
    apoios: ['Apoio. Dá prova para o buffet confiar.', 'Apoio, melhora a primeira impressão de quem recebe a mensagem.', 'Apoio. Não custa nada fazer.'],
    questionamentos: ['Qual é a frase que o buffet vai lembrar? Sem ela, o resto não pega.', 'Como medimos se isso trouxe conversa?'],
    ceo: ['Recebido. Monto o rascunho para você aprovar.', 'Entendido. Reviso a mensagem com esse foco.', 'Pode deixar comigo a proposta de texto.'],
  },
  suporte: {
    status: ['Revisando o roteiro de onboarding', 'Montando o checklist do catálogo', 'Preparando o acompanhamento dos dias 3, 7 e 14', 'Conferindo regras de preço por convidado', 'Escrevendo o relatório de 14 dias', 'Separando orçamentos antigos para teste'],
    perguntas: [
      { para: 'comercial', texto: 'Quando um buffet aceitar o teste, me passa o contato de quem cuida do cardápio? A reunião de 30 minutos precisa da pessoa certa.' },
      { para: 'ti', texto: 'O preço calculado bate com 3 orçamentos antigos do buffet? Se o buffet precisar desdizer o valor, ele abandona a ferramenta.' },
      { para: 'financeiro', texto: 'No dia 14, o relatório mostra quantos orçamentos chegaram. Qual número de orçamentos justifica o preço de fundador?' },
      { para: 'marketing', texto: 'Dá para ter um passo a passo de como colocar o link na bio e nos destaques? Muitos donos de buffet travam nisso.' },
    ],
    ideias: [
      { titulo: 'Catálogo pronto em 24 horas', descricao: 'Depois da reunião de 30 minutos, o catálogo do buffet fica pronto em um dia, conferido com orçamentos antigos. O link vai para a bio no mesmo dia.' },
      { titulo: 'Relatório de 14 dias com números do buffet', descricao: 'No fim do teste, mostrar quantos orçamentos chegaram, de quais pacotes e em que horários. É isso que sustenta a proposta paga.' },
    ],
    respostas: ['Faz sentido. Coloco isso no roteiro do onboarding.', 'Anotado. Ajusto o checklist do catálogo.', 'Boa, isso evita retrabalho no primeiro cliente.'],
    apoios: ['Apoio. Deixa o buffet seguro para usar.', 'Apoio, ajuda o link a virar o canal principal de orçamento.'],
    questionamentos: ['Quem garante que isso cabe na semana sem atrasar os catálogos?'],
    ceo: ['Recebido. Preparo o passo a passo para você revisar.', 'Entendido. Ajusto o onboarding com isso.'],
  },
  financeiro: {
    status: ['Simulando o preço de fundador', 'Calculando o valor de um evento a mais', 'Montando a proposta do dia 14', 'Conferindo as metas de validação', 'Comparando planos de R$ 197 a R$ 397'],
    perguntas: [
      { para: 'comercial', texto: 'Quantos buffets aceitaram o teste até agora, pela planilha? Sem esse número eu não consigo projetar nada.' },
      { para: 'suporte', texto: 'Quanto tempo leva montar um catálogo? Preciso saber o custo de cada teste para definir o preço.' },
      { para: 'marketing', texto: 'O argumento de um evento a mais por ano: evento de R$ 15 mil a R$ 50 mil contra assinatura de R$ 297. Dá para virar post?' },
      { para: 'comercial', texto: 'Na proposta do dia 14, prefere um plano só ou dois? Opção demais trava a decisão do buffet.' },
    ],
    ideias: [
      { titulo: 'Preço de fundador com prazo', descricao: 'No dia 14, oferecer o preço de fundador só para quem fechar na hora, por Pix ou cartão. Só pagamento real conta como validação.' },
      { titulo: 'Um plano só na validação', descricao: 'Testar um único plano (por exemplo, R$ 297) com preço de fundador. Depois que 3 buffets pagarem, a gente testa a escada de preços.' },
    ],
    respostas: ['Faço a conta e trago o impacto no preço.', 'Anotado. Isso entra na proposta do dia 14.', 'Boa. Ajusto a simulação com esse dado.'],
    apoios: ['Apoio. É simples e dá para medir.', 'Apoio, o custo é baixo.'],
    questionamentos: ['Quanto isso custa por buffet em teste?', 'Isso traz pagamento real ou só elogio?'],
    ceo: ['Recebido. Monto a simulação de preço para você decidir.', 'Entendido. Trago os números ainda hoje.'],
  },
  ti: {
    status: ['Revisando os bugs do teste real', 'Conferindo o domínio próprio', 'Testando o orçamento no celular', 'Revendo o aviso de lead novo', 'Checando backups e dados de cada buffet', 'Segurando funcionalidade nova'],
    perguntas: [
      { para: 'comercial', texto: 'Qual buffet entra primeiro no teste? Quero conferir o catálogo dele no celular antes do link ir para a bio.' },
      { para: 'suporte', texto: 'Quais regras de preço apareceram em mais de um buffet? Só essas entram no sistema agora.' },
      { para: 'marketing', texto: 'Posso esconder Pipeline, Agenda e Dashboard do painel durante o teste? Simplifica a vida do buffet.' },
      { para: 'financeiro', texto: 'A cobrança por Pix pode ser manual nos primeiros 3 clientes? Evita integrar gateway antes da hora.' },
    ],
    ideias: [
      { titulo: 'Aviso no WhatsApp a cada orçamento', descricao: 'Quando um cliente final conclui o orçamento, o buffet recebe um aviso na hora. Se o buffet não vê o lead, o teste não mostra valor.' },
      { titulo: 'Congelar funcionalidade nova até 3 pagando', descricao: 'Só corrigir o que bloqueia o teste real: domínio, bugs, preço certo e aviso de lead. Todo o resto espera.' },
    ],
    respostas: ['Anotado. Coloco no backlog com prioridade.', 'Faz sentido. Confiro isso antes do primeiro buffet real.', 'Boa. Isso é bug que bloqueia o teste.'],
    apoios: ['Apoio. Não exige funcionalidade nova.', 'Apoio, deixa o sistema confiável para o primeiro cliente.'],
    questionamentos: ['Isso é funcionalidade nova? A regra é esperar 3 buffets pagando.'],
    ceo: ['Recebido. Coloco no backlog e te mostro o que muda.', 'Entendido. Priorizo o que bloqueia o teste.'],
  },
};

// Falas montadas com os dados reais da planilha (nomes dos buffets esperando retorno).
let contexto = { pendentes: [], quentes: 0 };
export function definirContextoSimulado(novo) {
  contexto = { ...contexto, ...novo };
}
function perguntasDoMomento(setorId) {
  const nomes = contexto.pendentes.map((l) => l.buffet).filter(Boolean);
  if (!nomes.length) return [];
  const um = sortear(nomes);
  const comercial = [
    { para: 'marketing', texto: `${um} está esperando retorno. Me ajuda com a mensagem de hoje para eles?` },
    { para: 'marketing', texto: `${nomes.length} buffets estão esperando retorno na planilha. Um vídeo curto ajudaria a reabrir essas conversas?` },
    { para: 'financeiro', texto: `Se ${um} aceitar o teste, qual preço de fundador eu ofereço no dia 14?` },
  ];
  const outros = [{ para: 'comercial', texto: `Vi ${um} na pilha de quem espera retorno. Precisa de algo do nosso setor para destravar?` }];
  return setorId === 'comercial' ? comercial : outros;
}

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
    const dinamicas = Math.random() < 0.35 ? perguntasDoMomento(ctx.setor.id) : [];
    const perguntas = [...dinamicas, ...banco.perguntas].filter((p) => p.para === 'todos' || (setoresExistentes.has(p.para) && p.para !== ctx.setor.id));
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
