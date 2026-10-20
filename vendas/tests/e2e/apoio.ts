import { expect, type Page } from '@playwright/test';

export const GUI = { email: 'gui@vendas.local', senha: 'vendas12345' };

export const BASE = '/admin/prospeccao';

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

/** Data civil de hoje (ou daqui a N dias) em São Paulo, como o servidor calcula. */
export function hojeSP(dias = 0): string {
  const d = new Date(Date.now() + dias * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
}
