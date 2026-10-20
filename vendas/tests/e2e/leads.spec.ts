import { expect, test } from '@playwright/test';
import { BASE, entrarComoGui } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    await criarLead(sql, {
      nome: 'Buffet Uberaba A',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '34991110021',
      prioridade: 'A',
      segmento: 'buffet_infantil',
    });
    await criarLead(sql, {
      nome: 'Doces Uberaba',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '34991110022',
      prioridade: 'B',
      segmento: 'doces',
    });
    await criarLead(sql, {
      nome: 'Espaço Araguari',
      cidade: 'Araguari',
      uf: 'MG',
      digitos: '34991110023',
      prioridade: 'A',
      etapa: 'respondeu',
    });
  });
});

test('cadastra à mão; telefone repetido (mesmos dígitos) é recusado', async ({ page }) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/leads`);
  await page.getByTestId('novo-lead').click();
  const form = page.getByTestId('form-lead');
  await form.getByLabel('Nome da empresa').fill('Buffet Novo');
  await form.getByLabel('Telefone').fill('34991110021');
  await form.getByLabel('Cidade').fill('Uberaba');
  await form.getByRole('button', { name: 'Cadastrar lead' }).click();
  await expect(page.getByTestId('aviso-lead')).toHaveText('Já existe um lead com esse telefone.');

  await form.getByLabel('Telefone').fill('34991110029');
  await form.getByLabel('Prioridade').selectOption('A');
  await form.getByRole('button', { name: 'Cadastrar lead' }).click();
  await expect(page.getByTestId('lead')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Buffet Novo' })).toBeVisible();
  await expect(page.getByTestId('etapa-lead')).toHaveText('Não contatado');
  await expect(page.getByTestId('historico')).toContainText('Cadastro manual');
  const [l] = await noBanco(
    (sql) =>
      sql`select telefone, whatsapp, prioridade from public.vendas_leads where nome = 'Buffet Novo'`,
  );
  expect(l).toEqual({
    telefone: '(34) 99111-0029',
    whatsapp: 'https://wa.me/5534991110029',
    prioridade: 'A',
  });
});

test('filtra por cidade, prioridade, segmento e etapa; muda de etapa com 1 toque', async ({
  page,
}) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/leads`);
  const itens = page.getByTestId('item-lead');
  await expect(itens).toHaveCount(3);

  await page.getByRole('button', { name: 'Filtros' }).click();
  await page.getByLabel('Cidade').selectOption({ label: 'Uberaba/MG (2)' });
  await expect(itens).toHaveCount(2);
  await page.getByLabel('Prioridade').selectOption('A');
  await expect(itens).toHaveCount(1);
  await expect(itens.first()).toContainText('Buffet Uberaba A');
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(itens).toHaveCount(3);

  // os filtros continuam abertos depois de limpar
  await page.getByLabel('Segmento').selectOption('doces');
  await expect(itens).toHaveCount(1);
  await page.getByLabel('Segmento').selectOption('');
  await page.getByLabel('Etapa').selectOption('respondeu');
  await expect(itens).toHaveCount(1);
  await expect(itens.first()).toContainText('Espaço Araguari');
  await page.getByLabel('Etapa').selectOption('');
  await expect(itens).toHaveCount(3);

  // busca sem acento
  await page.getByLabel('Buscar lead').fill('espaco');
  await page.getByLabel('Buscar lead').press('Enter');
  await expect(itens).toHaveCount(1);
  await page.getByRole('button', { name: 'Limpar filtros' }).click();

  // 1 toque no chip da etapa
  const item = itens.filter({ hasText: 'Doces Uberaba' });
  await item.getByTestId('seletor-etapa').selectOption('em_teste');
  await expect
    .poll(() =>
      noBanco(
        async (sql) =>
          (await sql`select etapa from public.vendas_leads where nome = 'Doces Uberaba'`)[0]!.etapa,
      ),
    )
    .toBe('em_teste');

  // no lead, os botões das etapas; o histórico registra tudo
  await item.getByRole('link').click();
  await expect(page.getByTestId('etapa-lead')).toHaveText('Em teste');
  await page.getByTestId('botoes-etapa').getByRole('button', { name: 'Fechou' }).click();
  await expect(
    page.getByTestId('botoes-etapa').getByRole('button', { name: 'Fechou' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('etapa-lead')).toHaveText('Fechou');
  const movimentos = page.getByTestId('movimento');
  await expect(movimentos.first()).toContainText('Em teste → Fechou');
  await expect(movimentos.nth(1)).toContainText('Não contatado → Em teste');
});
