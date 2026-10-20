import { expect, test } from '@playwright/test';
import { criarXlsx } from '../apoio/xlsx';
import { BASE, entrarComoGui } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

const CABECALHO = [
  'NOME DA EMPRESA',
  'AVALIAÇÕES',
  'CIDADE',
  'NUMERO',
  'CATEGORIA DE NEGOCIO',
  'WHATSAPP',
  'SEGMENTO',
  'PRIORIDADE',
  'STATUS',
  'ORIGEM',
];

function planilha() {
  return criarXlsx([
    CABECALHO,
    [
      'Buffet Alegria',
      4.8,
      'Uberlândia - MG',
      34991110001,
      'Buffet infantil',
      '',
      'Buffet infantil',
      'A',
      'Não contatado',
      'Google Maps',
    ],
    [
      'Espaço Lua',
      120,
      'Uberaba',
      '(34) 3213-0002',
      'Salão de festas',
      '(34) 99111-0002',
      'Espaço de eventos',
      'B',
      '',
      'Google Maps',
    ],
    // mesmo telefone da primeira linha, escrito de outro jeito
    ['Buffet Alegria (filial)', '', 'Uberlândia', '+55 34 99111-0001', '', '', '', 'A', '', ''],
    // já existe no banco
    ['Doces da Ana', '', 'Uberaba', '34991110009', 'Confeitaria', '', 'Doces', 'C', '', ''],
    ['Sem Telefone', '', 'Uberaba', '', '', '', '', '', '', ''],
  ]);
}

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    await criarLead(sql, { nome: 'Doces da Ana', digitos: '34991110009' });
  });
});

test('importa XLSX com resumo antes de gravar e nunca duplica telefone', async ({ page }) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/leads`);
  await page.getByTestId('importar').click();
  await expect(page).toHaveURL(/\/leads\/importar$/);

  const arquivo = {
    name: 'Lista_Orkestra.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: planilha(),
  };
  await page.getByTestId('arquivo').setInputFiles(arquivo);
  const previa = page.getByTestId('previa-importacao');
  await expect(previa).toBeVisible();
  await expect(page.getByTestId('qtd-novos')).toHaveText('2');
  await expect(page.getByTestId('qtd-duplicados')).toHaveText('2');
  await expect(page.getByTestId('qtd-erros')).toHaveText('1');
  await expect(previa).toContainText('Repetida no arquivo');
  await expect(previa).toContainText('Já cadastrada');
  await expect(previa).toContainText('Sem telefone.');
  // nada gravado ainda
  expect(await noBanco((sql) => sql`select count(*)::int as n from public.vendas_leads`)).toEqual([
    { n: 1 },
  ]);

  await page.getByTestId('confirmar-importacao').click();
  await expect(page).toHaveURL(/\/leads\?importados=2$/);
  await expect(page.getByTestId('aviso-importacao')).toHaveText('2 leads importados.');
  await expect(page.getByTestId('total-leads')).toHaveText('3 leads');

  const leads = await noBanco(
    (
      sql,
    ) => sql`select nome, cidade, uf, telefone, telefone_digitos, whatsapp, segmento, prioridade,
      avaliacoes, etapa, origem from public.vendas_leads where nome <> 'Doces da Ana' order by nome`,
  );
  expect(leads).toEqual([
    {
      nome: 'Buffet Alegria',
      cidade: 'Uberlândia',
      uf: 'MG',
      telefone: '(34) 99111-0001',
      telefone_digitos: '34991110001',
      whatsapp: 'https://wa.me/5534991110001',
      segmento: 'buffet_infantil',
      prioridade: 'A',
      avaliacoes: '4,8',
      etapa: 'nao_contatado',
      origem: 'Google Maps',
    },
    {
      nome: 'Espaço Lua',
      cidade: 'Uberaba',
      uf: 'MG',
      telefone: '(34) 3213-0002',
      telefone_digitos: '3432130002',
      // o NUMERO é fixo; o WhatsApp vem da coluna WHATSAPP
      whatsapp: 'https://wa.me/5534991110002',
      segmento: 'espaco_eventos',
      prioridade: 'B',
      avaliacoes: '120',
      etapa: 'nao_contatado',
      origem: 'Google Maps',
    },
  ]);

  // importar o mesmo arquivo de novo: nada novo
  await page.goto(`${BASE}/leads/importar`);
  await page.getByTestId('arquivo').setInputFiles(arquivo);
  await expect(page.getByTestId('qtd-novos')).toHaveText('0');
  await expect(page.getByTestId('qtd-duplicados')).toHaveText('4');
  await expect(page.getByTestId('confirmar-importacao')).toBeDisabled();
});

test('CSV do Excel (ponto e vírgula, Windows-1252) e arquivo sem as colunas certas', async ({
  page,
}) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/leads/importar`);
  const csv = Buffer.from(
    'NOME DA EMPRESA;NUMERO;CIDADE;PRIORIDADE\nBuffet São João;(34) 99111-0003;Araguari;A\n',
    'latin1',
  );
  await page
    .getByTestId('arquivo')
    .setInputFiles({ name: 'lista.csv', mimeType: 'text/csv', buffer: csv });
  await expect(page.getByTestId('qtd-novos')).toHaveText('1');
  await page.getByTestId('confirmar-importacao').click();
  await expect(page.getByTestId('aviso-importacao')).toHaveText('1 lead importado.');
  await expect(page.getByTestId('lista-leads')).toContainText('Buffet São João');

  await page.goto(`${BASE}/leads/importar`);
  await page.getByTestId('arquivo').setInputFiles({
    name: 'errada.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('empresa;cidade\nX;Y\n'),
  });
  await expect(page.getByTestId('erro-importacao')).toContainText('NOME DA EMPRESA e NUMERO');
});
