import { expect, test } from '@playwright/test';
import { entrar, entrarComoGui, GUI } from './apoio';
import { noBanco } from './banco';

test('sem login vai para /entrar; quem não está na lista não entra', async ({ page }) => {
  await page.goto('/leads');
  await expect(page).toHaveURL(/\/entrar$/);

  await entrar(page, 'intruso@vendas.local', GUI.senha);
  await expect(page.getByTestId('erro-login')).toHaveText('E-mail ou senha incorretos.');

  await entrar(page, GUI.email, 'senha-errada');
  await expect(page.getByTestId('erro-login')).toHaveText('E-mail ou senha incorretos.');
});

test.beforeEach(async () => {
  await noBanco((sql) => sql`delete from public.vendas_leads`);
});

test('o Gui entra, navega pelas abas e sai', async ({ page }) => {
  await entrarComoGui(page);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('painel')).toContainText('Nada na fila hoje');

  const abas: [string, RegExp, string][] = [
    ['Pipeline', /\/pipeline$/, 'Pipeline vazio'],
    ['Leads', /\/leads$/, 'Nenhum lead ainda'],
    ['Conhecimento', /\/conhecimento$/, 'Adicionar à base'],
    ['Exemplos', /\/exemplos$/, 'Nenhum exemplo marcado'],
    ['Fila do dia', /\/$/, 'Nada na fila hoje'],
  ];
  for (const [rotulo, url, texto] of abas) {
    await page.getByTestId(`aba-${rotulo}`).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByTestId(`aba-${rotulo}`)).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('painel')).toContainText(texto);
  }

  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  await page.goto('/');
  await expect(page).toHaveURL(/\/entrar$/);
});
