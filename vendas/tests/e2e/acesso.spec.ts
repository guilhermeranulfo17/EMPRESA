import { expect, test } from '@playwright/test';
import { BASE, entrar, entrarComoGui, GUI } from './apoio';
import { limpar, noBanco } from './banco';

test('sem login vai para /entrar; quem não está na lista não entra', async ({ page }) => {
  await page.goto(`${BASE}/leads`);
  await expect(page).toHaveURL(/\/entrar$/);

  await entrar(page, 'intruso@vendas.local', GUI.senha);
  await expect(page.getByTestId('erro-login')).toHaveText('E-mail ou senha incorretos.');

  await entrar(page, GUI.email, 'senha-errada');
  await expect(page.getByTestId('erro-login')).toHaveText('E-mail ou senha incorretos.');
});

test.beforeEach(async () => {
  await noBanco(limpar);
});

test('o Gui entra direto no HOJE, navega pelo menu de baixo e sai', async ({ page }) => {
  await entrarComoGui(page);
  await expect(page).toHaveURL(/\/admin\/prospeccao$/);
  await expect(page.getByRole('heading', { name: 'Hoje', level: 1 })).toBeVisible();
  await expect(page.getByTestId('abordagens-hoje')).toHaveText('0');

  const telas: [string, RegExp, string][] = [
    ['Leads', /\/leads$/, 'Nenhum lead ainda'],
    ['Funil', /\/funil$/, 'Funil vazio'],
    ['Mensagens', /\/mensagens$/, 'Follow-up D+5'],
    ['Painel', /\/painel$/, '10 clientes em 3 meses'],
    ['Hoje', /\/prospeccao$/, 'Ninguém para abordar'],
  ];
  for (const [rotulo, url, texto] of telas) {
    await page.getByTestId(`menu-${rotulo}`).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByTestId(`menu-${rotulo}`)).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('painel')).toContainText(texto);
  }

  // a raiz leva para a área de prospecção
  await page.goto('/');
  await expect(page).toHaveURL(/\/admin\/prospeccao$/);

  await page.getByLabel('Mais opções').click();
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  await page.goto(BASE);
  await expect(page).toHaveURL(/\/entrar$/);
});
