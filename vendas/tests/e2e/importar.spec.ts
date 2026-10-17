import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';
import { noBanco } from './banco';

test('importa CSV com prévia, ignora repetidos e não duplica', async ({ page }) => {
  await noBanco(async (sql) => {
    await sql`delete from public.vendas_leads where telefone_e164 like '+553499999030%'`;
    await sql`insert into public.vendas_leads (nome, telefone_e164) values ('Já Existe', '+5534999990301')`;
  });
  await entrarComoGui(page);
  await page.getByTestId('aba-Leads').click();
  await page.getByTestId('importar-csv').click();
  await expect(page).toHaveURL(/\/leads\/importar$/);

  const csv = [
    'Responsável;Buffet;WhatsApp;Cidade',
    'Paula CSV;Buffet Lua;(34) 99999-0302;Araguari',
    'Já Existe;Buffet X;34999990301;Uberaba',
    'Repetida;Buffet Y;34 99999-0302;Uberaba',
    ';Sem Nome;34999990303;Uberaba',
    'Quim CSV;Buffet Mar;34999990304;Patos',
  ].join('\n');
  await page.setInputFiles('#arquivo', {
    name: 'leads.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf8'),
  });
  const previa = page.getByTestId('previa-importacao');
  await expect(previa).toContainText('2 leads novos de 5 linhas');
  await expect(previa).toContainText('Já cadastrada');
  await expect(previa).toContainText('Repetida no arquivo');
  await expect(previa).toContainText('Informe o nome.');
  await page.getByTestId('confirmar-importacao').click();
  await expect(page).toHaveURL(/\/leads\?importados=2$/);
  await expect(page.getByTestId('aviso-importacao')).toHaveText('2 leads importados.');
  await expect(page.getByTestId('lista-leads')).toContainText('Paula CSV');

  // importar de novo não duplica: a prévia já mostra zero novos
  await page.goto('/leads/importar');
  await page.getByLabel('Ou cole o conteúdo da planilha').fill(csv);
  await page.getByRole('button', { name: 'Ver prévia' }).click();
  await expect(previa).toContainText('0 leads novos de 5 linhas');
  await expect(page.getByTestId('confirmar-importacao')).toBeDisabled();

  // Excel em português salva em Windows-1252: acentos chegam certos
  await page.goto('/leads/importar');
  await page.setInputFiles('#arquivo', {
    name: 'excel.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('nome;cidade\nJoão Ávila;São José', 'latin1'),
  });
  await expect(previa).toContainText('João Ávila');
  await expect(previa).toContainText('São José');

  await noBanco(async (sql) => {
    const linhas = await sql`select l.nome, m.origem, m.motivo from public.vendas_leads l
      join public.vendas_movimentos m on m.lead_id = l.id
      where l.telefone_e164 in ('+5534999990302', '+5534999990304') order by l.nome`;
    expect(linhas).toEqual([
      { nome: 'Paula CSV', origem: 'importacao', motivo: 'Importação CSV' },
      { nome: 'Quim CSV', origem: 'importacao', motivo: 'Importação CSV' },
    ]);
  });
});
