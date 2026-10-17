import { expect, type Page } from '@playwright/test';

export const GUI = { email: 'gui@vendas.local', senha: 'vendas12345' };

export async function entrar(page: Page, email = GUI.email, senha = GUI.senha) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

export async function entrarComoGui(page: Page) {
  await entrar(page);
  await expect(page.getByTestId('painel')).toBeVisible();
}
