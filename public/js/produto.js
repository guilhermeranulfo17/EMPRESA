// Backlog do produto: o que falta para o sistema da Orkestra ficar pronto.
// O CEO mantém o status real; os agentes leem e sugerem tarefas novas.

export const STATUS_TAREFA = ['a fazer', 'fazendo', 'feito'];
export const TIPOS_TAREFA = ['funcionalidade', 'bug', 'melhoria', 'infraestrutura', 'segurança', 'lançamento'];
export const PRIORIDADES = ['alta', 'média', 'baixa'];

// Proposta inicial de MVP. É ponto de partida: o CEO marca o que já existe e remove o que não fizer sentido.
const MVP = [
  ['Conta do buffet: cadastro e login', 'funcionalidade', 'alta', 'rita', 'O dono do buffet cria a conta com e-mail e senha, entra e sai com segurança e recupera a senha.'],
  ['Cadastro de cardápios, pacotes, itens e preços', 'funcionalidade', 'alta', 'rita', 'O buffet cadastra pacotes (ex.: Básico, Premium), itens avulsos, preço por pessoa e preço fixo, e o mínimo de convidados.'],
  ['Orçamento interativo do cliente final', 'funcionalidade', 'alta', 'leo', 'Página no celular onde o cliente do buffet escolhe data, número de convidados, pacote e itens, e vê o preço total mudar na hora.'],
  ['Link do orçamento para mandar no WhatsApp', 'funcionalidade', 'alta', 'leo', 'Cada buffet tem um link próprio, com a marca dele, para mandar no WhatsApp e colocar no Instagram.'],
  ['Painel de orçamentos recebidos', 'funcionalidade', 'alta', 'leo', 'O buffet vê os orçamentos que os clientes montaram, com contato, data e valor, e marca como fechado ou perdido.'],
  ['Aviso ao buffet quando chega orçamento novo', 'funcionalidade', 'média', 'rita', 'E-mail (e depois WhatsApp) para o buffet quando um cliente conclui um orçamento.'],
  ['Modelos prontos de cardápio para começar rápido', 'melhoria', 'média', 'lara', '3 modelos (festa infantil, casamento, churrasco) que o buffet só ajusta, para a implantação levar minutos.'],
  ['Cobrança da assinatura de R$ 347', 'funcionalidade', 'alta', 'rita', 'Assinatura mensal com cartão ou boleto por um gateway de pagamento, com aviso de atraso e bloqueio de conta inadimplente.'],
  ['Painel interno da Orkestra', 'funcionalidade', 'média', 'rita', 'Lista de buffets clientes, status da assinatura, uso do sistema e MRR, para a equipe acompanhar.'],
  ['Hospedagem, domínio e HTTPS', 'infraestrutura', 'alta', 'sara', 'Sistema no ar num domínio da Orkestra, com certificado HTTPS e deploy simples.'],
  ['Backups e monitoramento', 'infraestrutura', 'alta', 'sara', 'Backup diário do banco, teste de restauração e alerta quando o sistema sair do ar.'],
  ['Termos de uso e política de privacidade (LGPD)', 'segurança', 'alta', 'sara', 'Textos publicados no sistema, aceite no cadastro e como o buffet pede a exclusão dos dados.'],
  ['Plano de testes e testes de ponta a ponta', 'lançamento', 'alta', 'igor', 'Casos de teste dos fluxos principais: cadastro, cardápio, orçamento no celular, painel e cobrança.'],
  ['Piloto com 2 ou 3 buffets', 'lançamento', 'alta', 'igor', 'Buffets reais usando o sistema de graça por algumas semanas, com coleta de problemas e depoimentos.'],
];

export function backlogInicial() {
  const agora = Date.now();
  return MVP.map(([titulo, tipo, prioridade, responsavel, descricao], i) => ({
    id: `tarefa_mvp_${i + 1}`,
    titulo, tipo, prioridade, responsavel, descricao,
    status: 'a fazer',
    mvp: true,
    origem: 'proposta inicial',
    criadoEm: agora + i,
  }));
}

export function progressoMvp(backlog) {
  const mvp = (backlog ?? []).filter((t) => t.mvp);
  const feitas = mvp.filter((t) => t.status === 'feito').length;
  return { feitas, total: mvp.length, fazendo: mvp.filter((t) => t.status === 'fazendo').length };
}
