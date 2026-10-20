import { expect, test } from '@playwright/test';
import { BASE, entrarComoGui, hojeSP } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

/* Roda com o servidor em VENDAS_IA_PROVEDOR=simulado (resposta fixa, sem chave). */

let leadId = '';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    leadId = await criarLead(sql, {
      nome: 'Buffet Conversa',
      cidade: 'Uberaba',
      digitos: '34991110051',
      etapa: 'mensagem_1',
    });
  });
});

test('cola a conversa, edita a sugestão e aceita: guarda a original e a minha, e a próxima análise aprende', async ({
  page,
}) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/leads/${leadId}`);
  const assistente = page.getByTestId('assistente');
  await assistente
    .getByLabel(/Cole aqui a conversa/)
    .fill('Gui: Oi, tudo bem?\nBuffet: Oi! Quanto custa?');
  await assistente.getByRole('button', { name: 'Analisar com IA' }).click();

  const sugestao = page.getByTestId('sugestao');
  await expect(page.getByTestId('resumo-ia')).toContainText('respondeu');
  await expect(page.getByTestId('etapa-ia')).toHaveValue('respondeu');
  await expect(page.getByTestId('data-ia')).toHaveValue(hojeSP(2));

  await page.getByTestId('mensagem-ia').fill('Fica uns 250 por mês. Te mando o link?');
  await expect(page.getByTestId('aviso-editada')).toBeVisible();
  await page.getByTestId('etapa-ia').selectOption('em_teste');
  await page.getByTestId('data-ia').fill(hojeSP(3));
  await sugestao.getByTestId('aceitar').click();
  await expect(sugestao).toHaveCount(0);

  await expect(page.getByTestId('etapa-lead')).toHaveText('Em teste');
  await expect(page.getByTestId('historico')).toContainText(
    'Fica uns 250 por mês. Te mando o link?',
  );
  await expect(page.getByTestId('historico')).toContainText('Etapa escolhida por você');

  const [s] = await noBanco(
    (
      sql,
    ) => sql`select status, editada, mensagem_sugerida, mensagem_final, final from public.vendas_sugestoes
      where lead_id = ${leadId}`,
  );
  expect(s).toEqual({
    status: 'aprovada',
    editada: true,
    mensagem_sugerida: expect.stringContaining('R$ 250'),
    mensagem_final: 'Fica uns 250 por mês. Te mando o link?',
    final: { etapa: 'em_teste', proximoFollowup: hojeSP(3) },
  });
  const [lead] = await noBanco(
    (sql) =>
      sql`select etapa, proximo_followup::text, resumo from public.vendas_leads where id = ${leadId}`,
  );
  expect(lead).toEqual({
    etapa: 'em_teste',
    proximo_followup: hojeSP(3),
    resumo: expect.stringContaining('respondeu'),
  });

  // a próxima análise leva a correção no prompt; recusar não muda nada
  await assistente.getByLabel(/Cole aqui a conversa/).fill('Buffet: Vou pensar.');
  await assistente.getByRole('button', { name: 'Analisar com IA' }).click();
  await expect(sugestao).toBeVisible();
  await noBanco(async (sql) => {
    const [aceita] =
      await sql`select id from public.vendas_sugestoes where lead_id = ${leadId} and status = 'aprovada'`;
    const [pendente] =
      await sql`select exemplos_usados from public.vendas_sugestoes where lead_id = ${leadId} and status = 'pendente'`;
    expect(pendente!.exemplos_usados).toEqual([aceita!.id]);
  });
  await sugestao.getByTestId('recusar').click();
  await expect(sugestao).toHaveCount(0);
  await expect(page.getByTestId('etapa-lead')).toHaveText('Em teste');
});

test('pedido para parar: a IA sugere Sem interesse e marca não contatar', async ({ page }) => {
  await entrarComoGui(page);
  await page.goto(`${BASE}/leads/${leadId}`);
  await page.getByLabel(/Cole aqui a conversa/).fill('Buffet: não quero, pare de mandar mensagem');
  await page.getByRole('button', { name: 'Analisar com IA' }).click();
  await expect(page.getByTestId('aviso-nao-contatar')).toBeVisible();
  await expect(page.getByTestId('etapa-ia')).toHaveValue('sem_interesse');
  await page.getByTestId('aceitar').click();
  await expect(page.getByTestId('etapa-lead')).toHaveText('Sem interesse');
  const [l] = await noBanco(
    (sql) =>
      sql`select nao_contatar, proximo_followup from public.vendas_leads where id = ${leadId}`,
  );
  expect(l).toEqual({ nao_contatar: true, proximo_followup: null });
});
