import { expect, test } from '@playwright/test';
import { BASE, entrarComoGui, hojeSP } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    await sql`update public.vendas_ajustes set inicio_metas = ${hojeSP(-10)}`;
    const a = await criarLead(sql, {
      nome: 'Painel A',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '34991110061',
      etapa: 'mensagem_1',
    });
    const b = await criarLead(sql, {
      nome: 'Painel B',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '34991110062',
      etapa: 'respondeu',
    });
    await criarLead(sql, {
      nome: 'Painel C',
      cidade: 'Araguari',
      uf: 'MG',
      digitos: '34991110063',
      etapa: 'fechou',
    });
    await criarLead(sql, {
      nome: 'Painel D',
      cidade: 'Araguari',
      uf: 'MG',
      digitos: '34991110064',
    });
    await sql`insert into public.vendas_movimentos (lead_id, de, para, origem, criado_em) values
      (${a}, 'nao_contatado', 'mensagem_1', 'mensagem', now()),
      (${b}, 'nao_contatado', 'mensagem_1', 'mensagem', now() - interval '1 day')`;
  });
});

test('funil, taxa de resposta, abordagens da semana, cidades e metas', async ({ page }) => {
  await entrarComoGui(page);
  await page.getByTestId('menu-Painel').click();
  const numeros = page.getByTestId('numeros');
  await expect(numeros).toContainText('Leads4');
  await expect(numeros).toContainText('Contatados3');
  await expect(numeros).toContainText('67%');
  await expect(numeros).toContainText('2 de 3 responderam');
  await expect(page.getByTestId('clientes-meta')).toContainText('1 de 10');
  await expect(page.getByTestId('metas')).toContainText('Feito');
  await expect(page.getByTestId('funil')).toContainText('Não contatado1');
  await expect(page.getByTestId('por-cidade')).toContainText('Uberaba/MG');
  await expect(page.getByTestId('semana')).toContainText('1');

  // meta do dia ajustável: o HOJE passa a usar
  await page.getByLabel('Abordagens por dia').fill('12');
  await page.getByRole('button', { name: 'Salvar metas' }).click();
  await expect(page.getByText('Metas salvas.')).toBeVisible();
  await page.goto(BASE);
  await expect(page.getByTestId('meta-dia')).toContainText('1 de 12 abordagens');
});
