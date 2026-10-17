import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';
import { noBanco } from './banco';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await sql`delete from public.vendas_leads`;
    await sql`insert into public.vendas_leads (nome, buffet, etapa) values
      ('Ana Pipeline', 'Buffet Sol', 'novo'), ('Bruno Pipeline', 'Buffet Mar', 'respondeu')`;
  });
});

test('move o lead de etapa, a mudança fica salva e vai para o histórico', async ({
  page,
  isMobile,
}) => {
  await entrarComoGui(page);
  await page.getByTestId('aba-Pipeline').click();
  const card = page.getByTestId('card-lead').filter({ hasText: 'Ana Pipeline' });
  // espera o Kanban ficar interativo (arrastar e "Mover para" são ligados no navegador)
  await expect(page.getByTestId('kanban')).toHaveAttribute('data-pronto', 'true');

  if (isMobile) {
    await expect(page.getByTestId('coluna-novo')).toContainText('Ana Pipeline');
    await card.getByLabel('Mover para').selectOption('abordado');
    await page.getByRole('button', { name: /^Abordado/ }).click();
  } else {
    await expect(page.getByTestId('coluna-respondeu')).toContainText('Bruno Pipeline');
    await card.dragTo(page.getByTestId('coluna-abordado'));
  }
  await expect(page.getByTestId('coluna-abordado')).toContainText('Ana Pipeline');
  await expect(page.getByTestId('kanban')).not.toHaveAttribute('data-salvando');

  // salvo no servidor: continua lá depois de recarregar
  await page.reload();
  await expect(page.getByTestId('kanban')).toHaveAttribute('data-pronto', 'true');
  if (isMobile) await page.getByRole('button', { name: /^Abordado/ }).click();
  await expect(page.getByTestId('coluna-abordado')).toContainText('Ana Pipeline');

  // histórico no lead
  await page.getByRole('link', { name: 'Ana Pipeline' }).click();
  await expect(page.getByTestId('etapa-lead')).toContainText('Abordado');
  await expect(page.getByTestId('historico-etapas')).toContainText(
    'Novo → Abordado · Ajuste manual no pipeline',
  );
});
