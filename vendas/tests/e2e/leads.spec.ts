import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';
import { noBanco } from './banco';

test('cadastra, busca e edita lead; telefone repetido é recusado', async ({ page }) => {
  await noBanco(
    (sql) => sql`delete from public.vendas_leads where telefone_e164 = '+5534999990101'`,
  );
  await entrarComoGui(page);

  // cadastra
  await page.getByTestId('aba-Leads').click();
  await page.getByTestId('novo-lead').click();
  await page.getByLabel('Nome').fill('Marta Teste');
  await page.getByLabel('Buffet', { exact: true }).fill('Buffet Sol');
  await page.getByLabel('Telefone (WhatsApp)').fill('34999990101');
  await page.getByLabel('Cidade').fill('São José');
  await page.getByLabel('Origem').fill('Instagram');
  await page.getByRole('button', { name: 'Cadastrar lead' }).click();
  await expect(page).toHaveURL(/\/leads$/);
  const lista = page.getByTestId('lista-leads');
  await expect(lista).toContainText('Marta Teste');
  await expect(lista).toContainText('(34) 99999-0101');
  await expect(lista).toContainText('Novo');

  // busca sem acento
  await page.getByLabel('Buscar lead').fill('sao jose');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(lista).toContainText('Marta Teste');

  // telefone repetido
  await page.goto('/leads/novo');
  await page.getByLabel('Nome').fill('Outra Pessoa');
  await page.getByLabel('Telefone (WhatsApp)').fill('34999990101');
  await page.getByRole('button', { name: 'Cadastrar lead' }).click();
  await expect(page.getByTestId('form-lead')).toContainText('Já existe um lead com esse telefone.');

  // edita: follow-up e não contatar
  await page.goto('/leads');
  await page.getByText('Marta Teste').click();
  await expect(page.getByTestId('etapa-lead')).toContainText('Novo');
  await page.getByLabel('Próximo follow-up').fill('2026-11-14');
  await page.getByLabel(/Não contatar/).check();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByTestId('aviso-lead')).toHaveText('Lead salvo.');
  await page.goto('/leads');
  await expect(lista).toContainText('Follow-up 14/11/2026');
  await expect(lista).toContainText('Não contatar');

  await noBanco(async (sql) => {
    const [m] = await sql`select m.para, m.origem, m.motivo from public.vendas_movimentos m
      join public.vendas_leads l on l.id = m.lead_id where l.telefone_e164 = '+5534999990101'`;
    expect(m).toMatchObject({ para: 'novo', origem: 'manual', motivo: 'Cadastro manual' });
  });
});
