import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';

/* Roda com o servidor em VENDAS_IA_PROVEDOR=simulado (resposta fixa, sem chave). */

test('Testar IA mostra a configuração e a resposta validada', async ({ page }) => {
  await entrarComoGui(page);
  await page.getByTestId('link-ia').click();
  await expect(page).toHaveURL(/\/ia$/);
  const config = page.getByTestId('config-ia');
  await expect(config).toContainText('Simulado');
  await expect(config).toContainText('copiloto.v1.md');
  await expect(config).toContainText('Não precisa');

  await page.getByRole('button', { name: 'Testar IA' }).click();
  const resultado = page.getByTestId('resultado-ia');
  await expect(resultado).toContainText('A IA respondeu no formato certo');
  await expect(page.getByTestId('mensagem-ia')).toContainText('Que bom que respondeu');
  await expect(resultado).toContainText('Respondeu');

  // pedido para parar: não contatar
  await page.getByLabel('Mensagem do lead').fill('Não quero receber mais mensagens.');
  await page.getByRole('button', { name: 'Testar IA' }).click();
  await expect(page.getByTestId('mensagem-ia')).toContainText('não te mando mais mensagem');
  await expect(resultado).toContainText('Perdido');

  // texto vazio
  await page.getByLabel('Mensagem do lead').fill('   ');
  await page.getByRole('button', { name: 'Testar IA' }).click();
  await expect(page.getByTestId('erro-ia')).toContainText('Cole uma mensagem para testar.');
});
