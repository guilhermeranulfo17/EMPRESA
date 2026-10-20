import { expect, test } from '@playwright/test';
import { BASE, entrarComoGui } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

/* Roda com o servidor em VENDAS_IA_PROVEDOR=simulado (resposta fixa, sem chave). */

let leadId = '';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    leadId = await criarLead(sql, {
      nome: 'Buffet Rita',
      digitos: '34991110071',
      etapa: 'mensagem_1',
    });
  });
});

test('marca a mensagem como boa, vê nos Exemplos e a IA passa a usar', async ({ page }) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/exemplos`);
  await expect(page.getByText('Nenhum exemplo marcado')).toBeVisible();

  // analisa, edita e aceita: vira uma correção
  await page.goto(`${BASE}/leads/${leadId}`);
  await page.getByLabel(/Cole aqui a conversa/).fill('Buffet: Quanto custa?');
  await page.getByRole('button', { name: 'Analisar com IA' }).click();
  await page.getByTestId('mensagem-ia').fill('Oi! Fica uns 250 por mês, te mando o link?');
  await page.getByTestId('aceitar').click();
  await expect(page.getByTestId('sugestao')).toHaveCount(0);

  // marca como boa com o motivo
  const avaliar = page.getByTestId('avaliar');
  await avaliar.getByRole('button', { name: 'Marcar como boa' }).click();
  await page.getByLabel('Motivo da avaliação').fill('ok');
  await page.getByRole('button', { name: 'Salvar avaliação' }).click();
  await expect(page.getByText('Escreva o motivo em uma frase.')).toBeVisible();
  await page.getByLabel('Motivo da avaliação').fill('Curta e direta');
  await page.getByRole('button', { name: 'Salvar avaliação' }).click();
  await expect(page.getByTestId('avaliar')).toContainText('Exemplo bom');

  await page.goto(`${BASE}/exemplos`);
  await expect(page.getByTestId('lista-exemplos')).toContainText('Curta e direta');
  await expect(page.getByTestId('lista-correcoes')).toContainText('te mando o link?');

  // a próxima análise leva o exemplo (bom e correção) no prompt
  await page.goto(`${BASE}/leads/${leadId}`);
  await page.getByLabel(/Cole aqui a conversa/).fill('Buffet: E quanto custa por mês?');
  await page.getByRole('button', { name: 'Analisar com IA' }).click();
  await expect(page.getByTestId('sugestao')).toBeVisible();
  await noBanco(async (sql) => {
    const [aprovada] = await sql`select id from public.vendas_sugestoes
      where lead_id = ${leadId} and status = 'aprovada'`;
    const [pendente] = await sql`select exemplos_usados from public.vendas_sugestoes
      where lead_id = ${leadId} and status = 'pendente'`;
    expect(pendente!.exemplos_usados).toEqual([aprovada!.id, aprovada!.id]);
  });

  // remover tira dos exemplos (a correção continua)
  await page.goto(`${BASE}/exemplos`);
  await page.getByRole('button', { name: 'Remover dos exemplos' }).click();
  await expect(page.getByTestId('lista-exemplos')).toHaveCount(0);
  await expect(page.getByTestId('lista-correcoes')).toBeVisible();
});
