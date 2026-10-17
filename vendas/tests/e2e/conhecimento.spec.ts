import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';
import { noBanco } from './banco';

test.beforeEach(async () => {
  await noBanco((sql) => sql`delete from public.vendas_conhecimento`);
});

test('adiciona, edita, desativa e exclui itens da base de conhecimento', async ({ page }) => {
  await entrarComoGui(page);
  await page.getByTestId('aba-Conhecimento').click();
  const form = page.getByTestId('form-conhecimento');

  // produto
  await form.getByLabel('Tipo').selectOption('produto');
  await form.getByLabel('Assunto').fill('Orçamento automático');
  await form.getByLabel('O que é verdade sobre isso').fill('O cliente monta a festa e vê o preço.');
  await form.getByRole('button', { name: 'Adicionar' }).click();
  const lista = page.getByTestId('lista-conhecimento');
  await expect(lista).toContainText('Orçamento automático');

  // objeção: os rótulos mudam
  await form.getByLabel('Tipo').selectOption('objecao');
  await form.getByLabel('Objeção do lead').fill('Está caro');
  await form.getByLabel('Como responder').fill('Mostra quanto tempo ele economiza.');
  await form.getByRole('button', { name: 'Adicionar' }).click();
  await expect(lista).toContainText('Está caro');
  await expect(page.getByRole('button', { name: 'Objeções 1' })).toBeVisible();

  // validação
  await form.getByLabel('Objeção do lead').fill('x');
  await form.getByRole('button', { name: 'Adicionar' }).click();
  await expect(form).toContainText('Escreva um título com pelo menos 2 letras.');

  // edita
  const objecao = page.getByTestId('item-conhecimento').filter({ hasText: 'Está caro' });
  await objecao.getByRole('button', { name: 'Editar' }).click();
  await page
    .getByTestId('form-editar-conhecimento')
    .getByLabel('Como responder')
    .fill('Compara com o custo de perder um cliente.');
  await page
    .getByTestId('form-editar-conhecimento')
    .getByRole('button', { name: 'Salvar' })
    .click();
  await expect(lista).toContainText('Compara com o custo de perder um cliente.');

  // desativa e reativa
  await objecao.getByRole('button', { name: 'Desativar' }).click();
  await expect(objecao).toContainText('Desativado');
  await noBanco(async (sql) => {
    const [i] = await sql`select ativo from public.vendas_conhecimento where titulo = 'Está caro'`;
    expect(i!.ativo).toBe(false);
  });
  await objecao.getByRole('button', { name: 'Reativar' }).click();
  await expect(objecao).not.toContainText('Desativado');

  // filtro e exclusão
  await page.getByRole('button', { name: 'Produto 1' }).click();
  await expect(lista).not.toContainText('Está caro');
  page.once('dialog', (d) => d.accept());
  await page
    .getByTestId('item-conhecimento')
    .filter({ hasText: 'Orçamento automático' })
    .getByRole('button', { name: 'Excluir' })
    .click();
  await expect(page.getByText('Nada aqui ainda.')).toBeVisible();
  await noBanco(async (sql) => {
    const linhas = await sql`select titulo from public.vendas_conhecimento`;
    expect(linhas.map((l) => l.titulo)).toEqual(['Está caro']);
  });
});
