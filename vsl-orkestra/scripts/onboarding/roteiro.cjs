// Roteiro do vídeo de onboarding do Orkestra (horizontal, tema claro).
// Cada passo: id, texto (barra de instrução na tela), fala (narração) e fazer (ações no sistema local).
// Contas fictícias: Buffet Girassol (criada do zero pela própria gravação) e Buffet Estrela (com dados).
const path = require('node:path');

const ARQ = (n) => path.join(__dirname, 'arquivos', n);
const G = { email: process.env.GIRASSOL_EMAIL, senha: process.env.GIRASSOL_SENHA };
const E = { email: process.env.ESTRELA_EMAIL, senha: process.env.ESTRELA_SENHA };

async function entrar(g, p, conta) {
  await g.ir('/login');
  await p.locator('input[type=email]').fill(conta.email);
  await p.locator('input[type=password]').fill(conta.senha);
  await p.getByRole('button', { name: /Entrar/ }).first().click();
  await p.waitForURL(/\/app/, { timeout: 30000 });
  await p.waitForLoadState('networkidle');
}

const secao = (p, titulo) =>
  p.locator('section, form, div.rounded-xl, div[class*="rounded"]').filter({ has: p.getByRole('heading', { name: titulo, exact: true }) }).last();
const botao = (p, nome) => p.getByRole('button', { name: nome });

module.exports = [
  // ------------------------------------------------------------------------------------------
  {
    id: 'c0',
    titulo: 'Primeiro acesso',
    passos: [
      {
        id: 'cadastro',
        texto: 'Crie sua conta grátis',
        fala: 'Para começar, entre no site do Orkestra e clique em criar conta grátis. Em poucos minutos o link de orçamento do seu buffet fica no ar.',
        fazer: async (g, p) => {
          await g.ir('/cadastro');
          await g.mostrar(p.locator('form'));
        },
      },
      {
        id: 'dados',
        texto: 'Seu nome, o nome do buffet e o WhatsApp',
        fala: 'Preencha o seu nome, o nome do buffet e o WhatsApp que vai receber os pedidos.',
        fazer: async (g, p) => {
          await g.digitar(p.locator('input[name=nome]'), 'Patrícia');
          await g.digitar(p.locator('input[name=nomeBuffet]'), 'Buffet Girassol');
          await g.digitar(p.locator('input[name=whatsapp]'), '34992000300');
        },
      },
      {
        id: 'segmento',
        texto: 'Escolha o tipo de buffet',
        fala: 'Escolha o tipo de buffet. A conta já vem com um modelo pronto para ele, com pacotes, opcionais, turnos e regras de exemplo.',
        fazer: async (g, p) => {
          await g.clicar(p.locator('label').filter({ has: p.locator('input[value=infantil]') }));
        },
      },
      {
        id: 'criar',
        texto: 'E-mail, senha e criar conta',
        fala: 'Coloque o seu e-mail e uma senha, aceite os termos e clique em criar conta grátis.',
        fazer: async (g, p) => {
          await g.digitar(p.locator('input[name=email]'), G.email);
          await g.digitar(p.locator('input[name=senha]'), G.senha);
          await g.clicar(p.getByRole('checkbox').first(), { force: true, espera: 2500 });
          await g.clicar(botao(p, 'Criar conta grátis'), { espera: 1000 });
          await p.waitForURL(/\/app\/comecar/, { timeout: 30000 });
          await p.waitForLoadState('networkidle');
        },
      },
      {
        id: 'passo1',
        texto: 'Passo 1: o modelo que já vem pronto',
        fala: 'A conta foi criada e o assistente de configuração abre sozinho. O primeiro passo mostra o que já veio no modelo. Tudo isso pode ser ajustado depois, em minha empresa.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('main').first());
          await g.clicar(botao(p, 'Continuar'), { espera: 1500 });
        },
      },
      {
        id: 'passo2',
        texto: 'Passo 2: logo, cidade e uma frase sobre o buffet',
        fala: 'No passo dois, envie o logo, informe a cidade e escreva uma frase sobre o buffet. Isso aparece na página que o cliente vê.',
        fazer: async (g, p) => {
          await g.enviar(p.locator('input[type=file]'), ARQ('logo-girassol.png'), { foco: p.locator('main'), espera: 3000 });
          await g.digitar(p.getByPlaceholder('Ex.: Uberlândia'), 'Uberlândia');
          await g.selecionar(p.locator('select').first(), 'MG');
          await g.digitar(p.getByPlaceholder(/Festas infantis/), 'Festas infantis com brinquedão, monitores e cardápio feito na hora.');
          await g.clicar(botao(p, 'Salvar e continuar'), { espera: 2500 });
        },
      },
      {
        id: 'passo3',
        texto: 'Passo 3: digite o preço de cada pacote',
        fala: 'O passo três é o mais importante: os seus preços. Digite o valor de cada pacote para até trinta convidados.',
        fazer: async (g, p) => {
          const precos = p.locator('input[id^=preco-]');
          await g.digitar(precos.nth(0), '2900');
          await g.digitar(precos.nth(1), '3400');
          await g.digitar(precos.nth(2), '4200');
        },
      },
      {
        id: 'passo3-faixas',
        texto: 'Confira as outras faixas e confirme',
        fala: 'As outras faixas de convidados são calculadas na mesma proporção, e você pode abrir e ajustar uma por uma. Só o preço que você confirmar aparece para o cliente.',
        fazer: async (g, p) => {
          await g.clicar(botao(p, 'Ver e ajustar as outras faixas').first(), { espera: 900 });
          await g.mostrar(p.locator('input[id^=faixa-]').first().locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
          await g.clicar(botao(p, 'Confirmar preços e continuar'), { espera: 2500 });
        },
      },
      {
        id: 'passo4',
        texto: 'Passo 4: espaços e horários',
        fala: 'No passo quatro, confira o salão, a capacidade e o horário de cada turno. Se já tiver festas fechadas, registre depois na agenda para essas datas não aparecerem como livres.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('main').first());
          await g.clicar(botao(p, 'Continuar'), { espera: 2500 });
        },
      },
      {
        id: 'passo5',
        texto: 'Passo 5: o seu link está no ar',
        fala: 'Pronto, o seu link está no ar. Copie e coloque na bio do Instagram, baixe o QR code para imprimir e teste como se fosse um cliente.',
        fazer: async (g, p) => {
          await g.mostrar(botao(p, 'Copiar link').first().locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
          await g.mostrar(p.getByRole('heading', { name: 'QR code' }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
          await g.clicar(p.getByRole('link', { name: /Ir para minha caixa de leads/ }).or(botao(p, /Ir para minha caixa de leads/)), { espera: 2500 });
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c1',
    titulo: 'Identidade do buffet',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'checklist',
        texto: 'Minha empresa: a lista do que falta',
        fala: 'Toda a configuração fica em minha empresa, e você muda quando quiser. No topo, esta lista mostra o quanto o seu link está pronto e o que ainda falta para vender melhor.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa');
          await g.mostrar(p.getByText(/Seu link está \d+% pronto/).locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), { bloco: 'start' });
        },
      },
      {
        id: 'identidade',
        texto: 'Nome, WhatsApp, cidade e cor da marca',
        fala: 'Em identidade ficam o nome, o WhatsApp, a cidade e a cor da marca, que pinta os botões da sua página e da proposta. Mudou alguma coisa, clique em salvar.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('#nome'));
          await g.digitar(p.locator('#cor'), '#D97706');
          await g.clicar(p.locator('form').filter({ has: p.locator('#cor') }).getByRole('button', { name: 'Salvar' }), { espera: 1800 });
        },
      },
      {
        id: 'proposta',
        texto: 'Razão social, CNPJ e endereço',
        fala: 'Em dados da proposta, coloque a razão social, o CNPJ e o endereço. Eles aparecem no rodapé da proposta e do PDF.',
        fazer: async (g, p) => {
          await g.digitar(p.locator('#razao-social'), 'Girassol Festas Ltda');
          await g.digitar(p.locator('#cnpj'), '11444777000161');
          await g.digitar(p.locator('#endereco'), 'Rua das Flores, 100 - Jardim Botânico, Uberlândia/MG');
          await g.clicar(p.locator('form').filter({ has: p.locator('#razao-social') }).getByRole('button', { name: 'Salvar' }), { espera: 1800 });
        },
      },
      {
        id: 'capa',
        texto: 'Envie a foto de capa',
        fala: 'Em logo e capa, envie uma foto do salão. A capa é a primeira imagem que o cliente vê no seu link.',
        fazer: async (g, p) => {
          const bloco = p.getByRole('heading', { name: 'Logo e capa' }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]');
          await g.enviar(p.locator('input[type=file]').nth(1), ARQ('capa.jpg'), { foco: bloco, botao: botao(p, /Enviar capa/), espera: 5000 });
        },
      },
      {
        id: 'link',
        texto: 'O endereço do seu link',
        fala: 'E aqui está o link do buffet. Dá para mudar o final do endereço, e o link antigo continua funcionando.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('#slug').locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c2',
    titulo: 'Espaços e turnos',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'espacos',
        texto: 'Onde acontecem as festas',
        fala: 'Em espaços e turnos você diz onde e quando acontecem as festas. Cada espaço tem um nome e a capacidade de convidados.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/agenda-config');
          await g.mostrar(p.getByRole('heading', { name: 'Espaços' }).locator('xpath=..'));
          await g.clicar(p.getByRole('button', { name: /Editar/ }).first(), { espera: 1200 });
          await g.mostrar(p.locator('form').first());
          await p.keyboard.press('Escape');
        },
      },
      {
        id: 'turnos',
        texto: 'Turnos: início, duração e dias',
        fala: 'Cada turno tem o horário de início, a duração e os dias da semana em que funciona. A agenda e o link usam isso para mostrar só os horários livres. Para criar outro, clique em adicionar turno.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/agenda-config');
          await g.mostrar(p.getByRole('heading', { name: 'Turnos' }).locator('xpath=..'));
          await g.clicar(p.getByRole('button', { name: /Editar/ }).nth(3), { espera: 1200 });
          await g.mostrar(p.locator('form').first());
          await p.keyboard.press('Escape');
          await g.mostrar(botao(p, /Adicionar turno/));
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c3',
    titulo: 'Catálogo: pacotes e opcionais',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'lista',
        texto: 'Pacotes, opcionais e tipos de festa',
        fala: 'No catálogo ficam os pacotes, os opcionais e os tipos de festa. A ordem desta lista é a ordem que o cliente vê.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/catalogo');
          await g.mostrar(p.getByRole('heading', { name: 'Pacotes' }).locator('xpath=..'));
        },
      },
      {
        id: 'pacote',
        texto: 'Abra o pacote para editar',
        fala: 'Clique no lápis para editar um pacote. Em dados do pacote ficam o nome, a descrição e o destaque, que mostra o selo de mais pedido.',
        fazer: async (g, p) => {
          await g.clicar(p.getByRole('link', { name: /Editar Alegria|Alegria/ }).first(), { espera: 2000 });
          await g.mostrar(p.locator('#pacote-nome').locator('xpath=ancestor::form[1]'), { bloco: 'start' });
        },
      },
      {
        id: 'preco',
        texto: 'Preço por faixa de convidados',
        fala: 'Em preço, escolha cobrar por faixa de convidados ou por pessoa. Na faixa, cada linha é o valor até aquela quantidade. Embaixo vão o valor de cada convidado a mais, o mínimo, o máximo e a hora extra. Cada bloco desta tela tem o seu botão de salvar.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('#faixa-valor-0'));
          await g.digitar(p.locator('#faixa-valor-1'), '3950');
          await g.mostrar(p.locator('#preco-hora-extra'));
          await g.clicar(p.locator('form').filter({ has: p.locator('#faixa-valor-1') }).getByRole('button', { name: /^Salvar/ }).last(), { espera: 1800 });
        },
      },
      {
        id: 'fotos',
        texto: 'Fotos do pacote',
        fala: 'Em fotos, envie as fotos do pacote. Pacote com foto vende mais.',
        fazer: async (g, p) => {
          const bloco = p.getByRole('heading', { name: 'Fotos' }).locator('xpath=..');
          await g.enviar(p.locator('input[type=file]').first(), ARQ('pacote-1.jpg'), { foco: bloco, espera: 6000 });
        },
      },
      {
        id: 'cardapio',
        texto: 'Cardápio por seções',
        fala: 'No cardápio, organize os itens por seções, como salgados, bebidas e doces. O cliente vê o cardápio na proposta.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('#secao-nome-0'));
          await g.mostrar(p.locator('#secao-nome-2'));
        },
      },
      {
        id: 'salvar',
        texto: 'Opcionais inclusos e salvar',
        fala: 'Por fim, marque os opcionais que já vêm inclusos neste pacote e clique em salvar.',
        fazer: async (g, p) => {
          await g.clicar(p.locator('label').filter({ has: p.locator('[id^=inclusos-]') }).first());
          await g.clicar(p.getByRole('button', { name: /^Salvar/ }).last(), { espera: 2500 });
        },
      },
      {
        id: 'opcional',
        texto: 'Opcionais: preço e forma de cobrar',
        fala: 'Os opcionais funcionam do mesmo jeito: nome, preço e se é cobrado por valor fixo, por unidade ou por hora. Você também escolhe em quais pacotes ele aparece.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/catalogo');
          await g.clicar(p.getByRole('link', { name: /Mesa temática/ }).first(), { espera: 2000 });
          await g.mostrar(p.locator('#opcional-preco'));
          await g.mostrar(p.locator('[id^=relacao-]').first());
        },
      },
      {
        id: 'novos',
        texto: 'Novo pacote e novo opcional',
        fala: 'Para criar um pacote ou um opcional do zero, use os botões novo pacote e novo opcional.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/catalogo');
          await g.mostrar(p.getByRole('link', { name: /Novo pacote/ }).or(botao(p, /Novo pacote/)));
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c4',
    titulo: 'Preços e regras',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'dias',
        texto: 'Ajustes por dia da semana',
        fala: 'Em preços e regras ficam as contas do orçamento. Os ajustes por dia mudam o preço conforme o dia: aqui, de segunda a quinta é quinze por cento mais barato, e o sábado é dez por cento mais caro.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/regras');
          await g.mostrar(p.locator('#ajuste-quando-0').locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), { bloco: 'start' });
          await g.mostrar(p.locator('#ajuste-valor-4'));
        },
      },
      {
        id: 'feriados',
        texto: 'Feriados',
        fala: 'Em feriados, cadastre as datas que devem ter o mesmo preço de fim de semana.',
        fazer: async (g, p) => {
          await g.mostrar(p.getByRole('heading', { name: 'Feriados' }).locator('xpath=..'));
        },
      },
      {
        id: 'criancas',
        texto: 'Quanto cada idade paga',
        fala: 'Em crianças, defina as faixas de idade e quanto cada uma paga. No exemplo, até cinco anos não paga, e de seis a dez paga metade.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('#empresa-faixa-0-rotulo').locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
        },
      },
      {
        id: 'deslocamento',
        texto: 'Deslocamento e intervalo entre festas',
        fala: 'Deslocamento é para quem faz festa no local do cliente: dá para cobrar por quilômetro ou por faixa de distância. Logo abaixo, o intervalo entre eventos garante o tempo de limpeza entre uma festa e outra.',
        fazer: async (g, p) => {
          await g.mostrar(p.getByRole('heading', { name: 'Deslocamento' }).locator('xpath=..'));
          await g.mostrar(p.locator('#agenda-intervalo'));
        },
      },
      {
        id: 'condicoes',
        texto: 'Sinal, parcelas, validade e prazos',
        fala: 'Nas condições comerciais vão o sinal para reservar a data, o número de parcelas, a validade da proposta, o prazo da pré-reserva e a antecedência mínima para fechar uma festa.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('#cond-sinal').locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
        },
      },
      {
        id: 'pagamento',
        texto: 'Formas de pagamento e como o preço aparece',
        fala: 'Marque as formas de pagamento que você aceita e escolha como o preço aparece para o cliente: o valor exato, uma faixa de preço, ou só depois do contato.',
        fazer: async (g, p) => {
          await g.clicar(p.locator('label').filter({ has: p.locator('[id="forma-Boleto"]') }).or(p.locator('label[for="forma-Boleto"]')).first());
          await g.mostrar(p.locator('input[name=modoExibicaoPreco]').first().locator('xpath=ancestor::fieldset[1]'));
        },
      },
      {
        id: 'textos',
        texto: 'Textos da proposta e salvar',
        fala: 'Por último, escreva as condições gerais, o que não está incluso e a política de cancelamento. Esses textos vão para a proposta. Cada bloco desta tela tem o seu botão de salvar.',
        fazer: async (g, p) => {
          await g.mostrar(p.locator('#cond-texto'));
          await g.mostrar(p.locator('#cond-cancelamento'));
          await g.clicar(p.locator('form').filter({ has: p.locator('#cond-texto') }).getByRole('button', { name: /^Salvar/ }).last(), { espera: 2000 });
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c5',
    titulo: 'Link e divulgação',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'link',
        texto: 'Seu link e o teste como cliente',
        fala: 'Em link e divulgação você cuida da página do buffet. No topo está o seu link, com o botão para copiar e o botão para testar como cliente.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/link');
          await g.mostrar(p.getByRole('heading', { name: 'Seu link' }).locator('xpath=ancestor::section[1]'), { bloco: 'start' });
        },
      },
      {
        id: 'frase',
        texto: 'Frase de apresentação, com prévia ao lado',
        fala: 'Escreva uma frase de apresentação e veja na hora, na prévia ao lado, como a página fica para o cliente.',
        fazer: async (g, p) => {
          await g.digitar(p.locator('#slogan'), 'Festa infantil com brinquedão, monitores e muito sabor', { foco: p.getByRole('heading', { name: 'Personalize sua página' }).locator('xpath=..') });
        },
      },
      {
        id: 'estilo',
        texto: 'Estilo e diferenciais',
        fala: 'Escolha o estilo da página e adicione os diferenciais do buffet, como monitores, brinquedão e estacionamento. Depois clique em salvar.',
        fazer: async (g, p) => {
          await g.clicar(p.locator('label').filter({ has: p.locator('input[name=estilo][value=festivo]') }));
          for (const d of ['Monitores', 'Brinquedão', 'Estacionamento']) {
            await g.clicar(p.getByRole('button', { name: new RegExp(`^\\+?\\s*${d}`) }).first(), { espera: 500 });
          }
          await g.clicar(p.locator('form').filter({ has: p.locator('#slogan') }).getByRole('button', { name: /^Salvar/ }).last(), { espera: 2500 });
        },
      },
      {
        id: 'galeria',
        texto: 'Galeria de fotos do espaço',
        fala: 'Na galeria, envie fotos do espaço e das festas. A primeira aparece maior. Clique em salvar galeria.',
        fazer: async (g, p) => {
          const bloco = p.getByRole('heading', { name: /Galeria do espaço/ }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]');
          await g.enviar(p.locator('input[type=file]').first(), [ARQ('galeria-1.jpg'), ARQ('galeria-2.jpg'), ARQ('galeria-3.jpg')], { foco: bloco, espera: 9000 });
          await g.clicar(botao(p, /Salvar galeria/), { espera: 3000 });
        },
      },
      {
        id: 'depoimentos',
        texto: 'Depoimentos e perguntas frequentes',
        fala: 'Depois, coloque depoimentos reais de clientes e as perguntas frequentes. O sistema nunca inventa depoimento: só aparece o que você escrever.',
        fazer: async (g, p) => {
          await g.mostrar(p.getByRole('heading', { name: /Depoimentos/ }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
          await g.mostrar(p.getByRole('heading', { name: /Perguntas frequentes/ }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]'));
        },
      },
      {
        id: 'canais',
        texto: 'Um link para cada canal',
        fala: 'Em links por canal, use um link diferente no Instagram, no WhatsApp e no Google. Assim você vê em números de onde vem cada cliente.',
        fazer: async (g, p) => {
          await g.mostrar(p.getByText('Links por canal', { exact: true }).first().locator('xpath=ancestor::section[1]'), { bloco: 'start' });
        },
      },
      {
        id: 'qr',
        texto: 'QR code e textos prontos',
        fala: 'O QR code pode ser baixado em imagem ou em PDF para imprimir. E em textos prontos tem a bio do Instagram, a mensagem do WhatsApp e um post, já com o seu link. É só copiar.',
        fazer: async (g, p) => {
          await g.mostrar(p.getByText('QR code', { exact: true }).first().locator('xpath=ancestor::section[1]'), { bloco: 'start' });
          await g.mostrar(p.getByText('Textos prontos', { exact: true }).first().locator('xpath=ancestor::section[1]'), { bloco: 'start' });
          await g.clicar(botao(p, /^Copiar/).last(), { espera: 1200 });
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c6',
    titulo: 'Conferir antes de divulgar',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'proposta',
        texto: 'Ver minha proposta',
        fala: 'Antes de divulgar, abra ver minha proposta. É exatamente o que o cliente recebe, com os seus preços, as suas condições e o cardápio.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/proposta-exemplo');
          await g.mostrar(p.getByRole('heading', { name: /Proposta nº/ }).locator('xpath=ancestor::div[1]'), { bloco: 'start' });
          await g.mostrar(p.getByText(/^investimento$/i).first(), { bloco: 'start' });
        },
      },
      {
        id: 'simulador',
        texto: 'Simulador: teste qualquer festa',
        fala: 'No simulador você testa qualquer festa: escolha a data, o turno, os convidados e o pacote, e confira o cálculo item por item, com o ajuste do dia e o sinal.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/simulador');
          await g.digitar(p.locator('#sim-data'), '06032027');
          await g.digitar(p.locator('#sim-adultos'), '40');
          await g.clicar(botao(p, /Calcular preço/).first(), { espera: 2000 });
          await g.mostrar(p.getByRole('heading', { name: 'Resultado' }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), { bloco: 'start' });
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c7',
    titulo: 'Follow-up automático',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'regras',
        texto: 'Tarefas automáticas para não esquecer ninguém',
        fala: 'Em follow-up ficam as tarefas automáticas: o sistema lembra você de chamar o cliente na hora certa. Por exemplo, proposta sem resposta cria uma tarefa depois de vinte e quatro horas.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/follow-up');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
          await g.selecionar(p.getByLabel('Prazo de Proposta sem resposta'), '48');
        },
      },
      {
        id: 'mais',
        texto: 'Ligue, desligue e ajuste o prazo',
        fala: 'Tem também cobrar o sinal, confirmar a visita e lead quente sem contato. Ligue ou desligue cada regra e ajuste o prazo. As tarefas aparecem na sua caixa de leads.',
        fazer: async (g, p) => {
          await g.mostrar(p.getByLabel('Prazo de Cobrar o sinal'));
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c8',
    titulo: 'Usuários, plano e privacidade',
    preparar: async (g, p) => entrar(g, p, G),
    passos: [
      {
        id: 'usuarios',
        texto: 'Vendedores com login próprio',
        fala: 'Em usuários, cadastre os seus vendedores. Cada um tem login próprio, atende os leads e faz orçamentos, mas não muda a configuração. Você define o limite de desconto de cada um.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/usuarios');
          await g.clicar(botao(p, /Novo vendedor/), { espera: 1200 });
          await g.mostrar(p.locator('form').last());
          await p.keyboard.press('Escape');
        },
      },
      {
        id: 'plano',
        texto: 'Plano e acesso do suporte',
        fala: 'Em plano você acompanha o teste grátis, faz a assinatura e libera o acesso do suporte quando precisar de ajuda.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/plano');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
      {
        id: 'privacidade',
        texto: 'Privacidade e dados',
        fala: 'E em privacidade e dados você define por quanto tempo guardar os leads e pode exportar todos os seus dados quando quiser.',
        fazer: async (g, p) => {
          await g.ir('/app/empresa/privacidade');
          await g.mostrar(p.locator('#retencao'));
        },
      },
    ],
  },
  // ------------------------------------------------------------------------------------------
  {
    id: 'c9',
    titulo: 'O dia a dia',
    preparar: async (g, p) => entrar(g, p, E),
    passos: [
      {
        id: 'caixa',
        texto: 'Caixa de leads, por prioridade',
        fala: 'Agora, o dia a dia. Os pedidos do link caem na caixa de leads, já em ordem de prioridade: primeiro quem pediu pré-reserva ou visita, depois as tarefas do dia.',
        fazer: async (g, p) => {
          await g.ir('/app/leads');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
      {
        id: 'funil',
        texto: 'Ou veja em funil',
        fala: 'Se preferir, veja em funil, com cada negociação na sua etapa: novo, em conversa, proposta, pré-reserva e reservado.',
        fazer: async (g, p) => {
          await g.clicar(p.getByRole('link', { name: 'Funil' }).or(botao(p, 'Funil')).first(), { espera: 2000 });
          await g.mostrar(null);
        },
      },
      {
        id: 'lead',
        texto: 'Tudo sobre o lead em uma tela',
        fala: 'Clique no lead para ver tudo: a data, o pacote, o valor e a linha do tempo do que o cliente fez no link.',
        fazer: async (g, p) => {
          await g.ir('/app/leads');
          await g.clicar(p.getByText('Mariana', { exact: true }).first(), { espera: 2500 });
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
      {
        id: 'whatsapp',
        texto: 'Mensagem pronta para o WhatsApp',
        fala: 'O botão WhatsApp abre uma mensagem pronta para o momento da negociação. Você revisa e envia pelo seu próprio WhatsApp.',
        fazer: async (g, p) => {
          await g.clicar(botao(p, 'WhatsApp').last(), { espera: 1500 });
          await g.mostrar(p.getByRole('dialog').first());
          await p.keyboard.press('Escape');
        },
      },
      {
        id: 'confirmar',
        texto: 'Sinal pago: confirme a reserva',
        fala: 'Quando o cliente pagar o sinal, clique em confirmar. A data fica reservada na agenda e o lead vai para reservado.',
        fazer: async (g, p) => {
          await g.clicar(botao(p, /Confirmar \(sinal pago\)/).first(), { espera: 1500 });
          const sinal = p.getByLabel(/^Sinal/).first();
          if (await sinal.count()) await g.digitar(sinal, '1665');
          await g.clicar(botao(p, /Confirmar reserva/).first(), { espera: 2500 });
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
      {
        id: 'orcamento',
        texto: 'Orçamento para quem chama no WhatsApp',
        fala: 'Para quem chama pelo WhatsApp ou pelo telefone, use o botão mais orçamento. Preencha o cliente, a festa e o pacote, e o sistema calcula o preço com as suas regras.',
        fazer: async (g, p) => {
          await g.ir('/app/orcamentos/novo');
          await g.digitar(p.getByPlaceholder(/\(34\)|99135/).first(), '34992000777');
          await g.digitar(p.getByLabel('Nome do cliente'), 'Juliana');
          await g.clicar(p.getByText('Aniversário infantil', { exact: true }).first(), { espera: 1200 });
          await g.mostrar(p.getByRole('heading', { name: 'Festa' }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]'), { bloco: 'start' });
        },
      },
      {
        id: 'agenda',
        texto: 'Agenda do mês',
        fala: 'Na agenda você vê o mês inteiro: livre, pré-reservado, reservado e bloqueado. Clique no dia para ver os turnos, registrar uma festa ou bloquear a data.',
        fazer: async (g, p) => {
          await g.ir('/app/agenda?mes=2026-12');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
          await g.clicar(p.locator('[data-testid="dia-2026-12-05"]').or(p.getByRole('button', { name: /5 de dezembro|05\/12/ })).first(), { espera: 1800 });
          await g.mostrar(null);
        },
      },
      {
        id: 'contratos',
        texto: 'Contratos com assinatura pelo celular',
        fala: 'Em contratos, você gera o contrato a partir do orçamento, com os dados já preenchidos, e o cliente assina pelo celular. Os modelos de contrato ficam no botão modelos.',
        fazer: async (g, p) => {
          await g.ir('/app/contratos');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
      {
        id: 'financeiro',
        texto: 'Financeiro: parcelas e recebimentos',
        fala: 'No financeiro ficam as parcelas de cada festa: o que já recebeu, o que vence e o que está atrasado. Abra a festa para montar o plano de pagamento e registrar cada recebimento.',
        fazer: async (g, p) => {
          await g.ir('/app/financeiro');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
          await g.clicar(p.getByRole('link', { name: /Festa da Helô/ }).first(), { espera: 2200 });
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
      {
        id: 'clientes',
        texto: 'Clientes e hora de chamar de novo',
        fala: 'Em clientes ficam as famílias que já fizeram festa com você, com o aviso de hora de chamar de novo para o próximo aniversário.',
        fazer: async (g, p) => {
          await g.ir('/app/clientes');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
      {
        id: 'numeros',
        texto: 'Números do seu buffet',
        fala: 'Em números você acompanha o funil do link, de onde vem quem fecha, por que você perdeu e a ocupação da agenda.',
        fazer: async (g, p) => {
          await g.ir('/app/numeros');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
          await g.mostrar(p.getByRole('heading', { name: 'Funil do link' }).locator('xpath=..'));
        },
      },
      {
        id: 'avisos',
        texto: 'Ative os avisos no celular',
        fala: 'Por fim, ative os avisos no celular em minha conta, para saber na hora quando chega um pedido. Pronto: é isso que você precisa para usar o Orkestra no dia a dia.',
        fazer: async (g, p) => {
          await g.ir('/app/conta/avisos');
          await g.mostrar(p.locator('main').first(), { bloco: 'start' });
        },
      },
    ],
  },
];
