import { expect, test } from '@playwright/test';
import { BASE, entrarComoGui } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    await criarLead(sql, {
      nome: 'Buffet Pipoca',
      cidade: 'Araxá',
      uf: 'MG',
      digitos: '34991110041',
      segmento: 'buffet_infantil',
      prioridade: 'A',
    });
  });
});

test('edita o modelo com variáveis e o HOJE já usa o texto preenchido', async ({ page }) => {
  await entrarComoGui(page);
  await page.getByTestId('menu-Mensagens').click();
  const modelo = page.getByTestId('modelo-mensagem_1');
  await modelo
    .getByLabel('Mensagem 1')
    .fill('Oi! Vi o {nome} em {cidade}. Vocês fazem {segmento}?');
  await modelo.getByRole('button', { name: 'Salvar' }).click();
  await expect(modelo.getByRole('status')).toHaveText('Modelo salvo.');

  // vazio não salva; travessão avisa
  await modelo.getByLabel('Mensagem 1').fill('  ');
  await modelo.getByRole('button', { name: 'Salvar' }).click();
  await expect(modelo.getByRole('status')).toHaveText('O modelo não pode ficar vazio.');
  await modelo.getByLabel('Mensagem 1').fill('Oi — tudo bem?');
  await expect(modelo).toContainText('Tem travessão no texto');
  await page.reload();
  await expect(page.getByTestId('modelo-mensagem_1').getByLabel('Mensagem 1')).toHaveValue(
    'Oi! Vi o {nome} em {cidade}. Vocês fazem {segmento}?',
  );

  await page.getByTestId('menu-Hoje').click();
  const texto = 'Oi! Vi o Buffet Pipoca em Araxá. Vocês fazem buffet infantil?';
  const card = page.getByTestId('card-hoje').filter({ hasText: 'Buffet Pipoca' });
  await expect(card).toContainText(texto);
  await expect(card.getByTestId('abrir-whatsapp')).toHaveAttribute(
    'href',
    `https://wa.me/5534991110041?text=${encodeURIComponent(texto)}`,
  );

  // ajustar só para este lead antes de mandar
  await card.getByRole('button', { name: /ver ou ajustar/ }).click();
  await card.getByLabel('Mensagem').fill('Oi! Texto só para o Pipoca.');
  await expect(card.getByTestId('abrir-whatsapp')).toHaveAttribute(
    'href',
    `https://wa.me/5534991110041?text=${encodeURIComponent('Oi! Texto só para o Pipoca.')}`,
  );
});

test('no lead, escolhe a resposta "quanto custa" e manda: vai para Respondeu', async ({ page }) => {
  await noBanco(
    (sql) => sql`update public.vendas_leads set etapa = 'mensagem_1', ultimo_modelo = 'mensagem_1'`,
  );
  await entrarComoGui(page);
  await page.goto(`${BASE}/leads`);
  await page.getByRole('link', { name: /Buffet Pipoca/ }).click();
  const caixa = page.getByTestId('mensagens-lead');
  // sugere o próximo passo da cadência
  await expect(caixa.getByRole('button', { name: 'Follow-up D+2' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await caixa.getByRole('button', { name: 'Resposta "quanto custa"' }).click();
  await expect(caixa.getByTestId('texto-modelo')).toHaveValue(/R\$ 250/);
  const popup = page.waitForEvent('popup');
  await caixa.getByTestId('abrir-whatsapp').click();
  await (await popup).close();
  await expect(page.getByTestId('etapa-lead')).toHaveText('Respondeu');
  await expect(page.getByTestId('historico')).toContainText(
    'Resposta "quanto custa" enviada pelo WhatsApp',
  );
});
