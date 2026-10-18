import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';
import { noBanco } from './banco';

/* Roda com o servidor em VENDAS_IA_PROVEDOR=simulado (resposta fixa, sem chave). */

let leadId = '';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await sql`delete from public.vendas_leads`;
    const [l] = await sql`insert into public.vendas_leads (nome, buffet, etapa)
      values ('Rita Exemplo', 'Buffet Rita', 'abordado') returning id`;
    leadId = l!.id;
  });
});

test('marca a mensagem como boa, vê nos Exemplos e o copiloto passa a usar', async ({ page }) => {
  await entrarComoGui(page);
  await page.getByTestId('aba-Exemplos').click();
  await expect(page.getByText('Nenhum exemplo marcado')).toBeVisible();

  // gera, edita e aprova: vira uma correção
  await page.goto(`/leads/${leadId}`);
  await page.getByLabel('O que o lead respondeu').fill('Quanto custa?');
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  await page.getByTestId('mensagem-ia').fill('Oi Rita! Te passo o valor, posso te ligar 2 min?');
  await page.getByRole('button', { name: 'Aprovar', exact: true }).click();
  await expect(page.getByTestId('sugestao')).toHaveCount(0);

  // marca como boa com o motivo
  const avaliar = page.getByTestId('avaliar');
  await avaliar.getByRole('button', { name: 'Marcar como boa' }).click();
  await page.getByLabel('Motivo da avaliação').fill('ok');
  await page.getByRole('button', { name: 'Salvar avaliação' }).click();
  await expect(page.getByText('Escreva o motivo em uma frase.')).toBeVisible();
  await page.getByLabel('Motivo da avaliação').fill('Curta e chama para ligação');
  await page.getByRole('button', { name: 'Salvar avaliação' }).click();
  await expect(page.getByTestId('avaliar')).toContainText('Exemplo bom');

  await page.getByTestId('aba-Exemplos').click();
  await expect(page.getByTestId('lista-exemplos')).toContainText('Curta e chama para ligação');
  await expect(page.getByTestId('lista-correcoes')).toContainText('posso te ligar 2 min?');

  // a próxima sugestão leva o exemplo (bom e correção) no prompt
  await page.goto(`/leads/${leadId}`);
  await page.getByLabel('O que o lead respondeu').fill('E quanto custa por mês?');
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  await expect(page.getByTestId('sugestao')).toBeVisible();
  await noBanco(async (sql) => {
    const [aprovada] = await sql`select id from public.vendas_sugestoes
      where lead_id = ${leadId} and status = 'aprovada'`;
    const [pendente] = await sql`select exemplos_usados from public.vendas_sugestoes
      where lead_id = ${leadId} and status = 'pendente'`;
    expect(pendente!.exemplos_usados).toEqual([aprovada!.id, aprovada!.id]);
  });

  // remover tira dos exemplos (a correção continua)
  await page.getByTestId('aba-Exemplos').click();
  await page.getByRole('button', { name: 'Remover dos exemplos' }).click();
  await expect(page.getByTestId('lista-exemplos')).toHaveCount(0);
  await expect(page.getByTestId('lista-correcoes')).toBeVisible();
});
