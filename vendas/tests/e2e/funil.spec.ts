import { expect, test } from '@playwright/test';
import { BASE, entrarComoGui } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    await criarLead(sql, { nome: 'Buffet Funil A', cidade: 'Uberaba', digitos: '34991110031' });
    await criarLead(sql, {
      nome: 'Buffet Funil B',
      cidade: 'Uberaba',
      digitos: '34991110032',
      etapa: 'respondeu',
    });
  });
});

test('move o card de etapa no kanban, fica salvo e vai para o histórico', async ({
  page,
  isMobile,
}) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/funil`);
  const card = page.getByTestId('card-lead').filter({ hasText: 'Buffet Funil A' });
  await expect(page.getByTestId('kanban')).toHaveAttribute('data-pronto', 'true');

  if (isMobile) {
    await expect(page.getByTestId('coluna-nao_contatado')).toContainText('Buffet Funil A');
    await card.getByLabel('Mover para').selectOption('em_teste');
    await page.getByRole('button', { name: /^Em teste/ }).click();
  } else {
    await expect(page.getByTestId('coluna-respondeu')).toContainText('Buffet Funil B');
    await card.dragTo(page.getByTestId('coluna-em_teste'));
  }
  await expect(page.getByTestId('coluna-em_teste')).toContainText('Buffet Funil A');
  await expect(page.getByTestId('kanban')).not.toHaveAttribute('data-salvando');

  await page.reload();
  await expect(page.getByTestId('kanban')).toHaveAttribute('data-pronto', 'true');
  if (isMobile) await page.getByRole('button', { name: /^Em teste/ }).click();
  await expect(page.getByTestId('coluna-em_teste')).toContainText('Buffet Funil A');

  await page.getByRole('link', { name: 'Buffet Funil A' }).click();
  await expect(page.getByTestId('etapa-lead')).toHaveText('Em teste');
  await expect(page.getByTestId('movimento').first()).toContainText('Não contatado → Em teste');
});
