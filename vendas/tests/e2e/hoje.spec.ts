import { expect, test, type Page } from '@playwright/test';
import { entrarComoGui, hojeSP } from './apoio';
import { criarLead, limpar, noBanco } from './banco';

/** Toca em "Abrir no WhatsApp" do cartão e confere o link do wa.me que abriu. */
async function abrirWhatsApp(page: Page, nome: string) {
  const card = page.getByTestId('card-hoje').filter({ hasText: nome });
  const link = card.getByTestId('abrir-whatsapp');
  const href = await link.getAttribute('href');
  const popup = page.waitForEvent('popup');
  await link.click();
  await (await popup).close();
  return href!;
}

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await limpar(sql);
    await sql`update public.vendas_modelos set texto = 'Oi! Vi o {nome} aí em {cidade}.' where chave = 'mensagem_1'`;
    await sql`update public.vendas_modelos set texto = 'Oi de novo, {nome}!' where chave = 'followup_2'`;
    await sql`update public.vendas_modelos set texto = 'Última, {nome}.' where chave = 'followup_5'`;
    await criarLead(sql, {
      nome: 'Uberaba B',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '34991110011',
      prioridade: 'B',
    });
    await criarLead(sql, {
      nome: 'Uberaba A',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '34991110012',
      prioridade: 'A',
    });
    await criarLead(sql, {
      nome: 'Uberaba C',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '34991110013',
      prioridade: 'C',
    });
    await criarLead(sql, {
      nome: 'Uberaba Fixo',
      cidade: 'Uberaba',
      uf: 'MG',
      digitos: '3432130014',
      prioridade: 'C',
    });
    await criarLead(sql, {
      nome: 'Araguari B',
      cidade: 'Araguari',
      uf: 'MG',
      digitos: '34991110015',
      prioridade: 'B',
    });
  });
});

test('uma cidade por vez, A antes de B; mandar a Mensagem 1 conta na meta e agenda o D+2', async ({
  page,
}) => {
  await entrarComoGui(page);
  const cards = page.getByTestId('secao-abordar').getByTestId('card-hoje');
  // Uberaba tem lead A: vem primeiro
  await expect(page.getByRole('link', { name: /Uberaba\/MG/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0)).toContainText('Uberaba A');
  await expect(cards.nth(1)).toContainText('Uberaba B');

  const href = await abrirWhatsApp(page, 'Uberaba A');
  expect(href).toBe(
    `https://wa.me/5534991110012?text=${encodeURIComponent('Oi! Vi o Uberaba A aí em Uberaba.')}`,
  );
  await expect(page.getByTestId('abordagens-hoje')).toHaveText('1');
  await expect(cards).toHaveCount(3);

  const [lead] = await noBanco(
    (sql) =>
      sql`select etapa, proximo_followup::text, ultimo_modelo from public.vendas_leads where nome = 'Uberaba A'`,
  );
  expect(lead).toEqual({
    etapa: 'mensagem_1',
    proximo_followup: hojeSP(2),
    ultimo_modelo: 'mensagem_1',
  });
  const historico = await noBanco(
    (
      sql,
    ) => sql`select m.origem, m.motivo, (select texto from public.vendas_mensagens g where g.lead_id = l.id) as texto
      from public.vendas_movimentos m join public.vendas_leads l on l.id = m.lead_id where l.nome = 'Uberaba A'`,
  );
  expect(historico).toEqual([
    {
      origem: 'mensagem',
      motivo: 'Mensagem 1 enviada pelo WhatsApp',
      texto: 'Oi! Vi o Uberaba A aí em Uberaba.',
    },
  ]);

  // telefone fixo: copia e marca como enviada
  await page
    .getByTestId('card-hoje')
    .filter({ hasText: 'Uberaba Fixo' })
    .getByTestId('copiar-enviada')
    .click();
  await expect(page.getByTestId('abordagens-hoje')).toHaveText('2');

  // trocar de cidade
  await page.getByRole('link', { name: /Araguari\/MG/ }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('Araguari B');
});

test('follow-ups: D+2, depois D+5, e sem resposta vai sozinho para Sem interesse', async ({
  page,
}) => {
  await noBanco(
    (sql) => sql`update public.vendas_leads set etapa = 'mensagem_1', ultimo_modelo = 'mensagem_1',
      proximo_followup = ${hojeSP()} where nome = 'Uberaba B'`,
  );
  await entrarComoGui(page);
  const followups = page.getByTestId('secao-followups');
  await expect(followups).toContainText('Uberaba B');
  await expect(followups).toContainText('Follow-up hoje');
  await expect(followups).toContainText('Follow-up D+2');

  await abrirWhatsApp(page, 'Uberaba B');
  await expect(page.getByTestId('secao-followups')).toHaveCount(0);
  let [l] = await noBanco(
    (sql) =>
      sql`select etapa, proximo_followup::text, ultimo_modelo from public.vendas_leads where nome = 'Uberaba B'`,
  );
  expect(l).toEqual({
    etapa: 'followup',
    proximo_followup: hojeSP(3),
    ultimo_modelo: 'followup_2',
  });
  // follow-up não conta como abordagem
  await expect(page.getByTestId('abordagens-hoje')).toHaveText('0');

  // chegou o dia do D+5
  await noBanco(
    (sql) =>
      sql`update public.vendas_leads set proximo_followup = ${hojeSP(-1)} where nome = 'Uberaba B'`,
  );
  await page.reload();
  await expect(followups).toContainText('Atrasado 1 dia');
  await expect(followups).toContainText('Follow-up D+5');
  await abrirWhatsApp(page, 'Uberaba B');
  await expect(page.getByTestId('secao-followups')).toHaveCount(0);
  [l] = await noBanco(
    (sql) =>
      sql`select etapa, proximo_followup::text, ultimo_modelo from public.vendas_leads where nome = 'Uberaba B'`,
  );
  expect(l).toEqual({
    etapa: 'followup',
    proximo_followup: hojeSP(3),
    ultimo_modelo: 'followup_5',
  });

  // prazo final sem resposta: ao abrir o HOJE, vai para Sem interesse e fica no histórico
  await noBanco(
    (sql) =>
      sql`update public.vendas_leads set proximo_followup = ${hojeSP()} where nome = 'Uberaba B'`,
  );
  await page.reload();
  const [fim] = await noBanco(
    (sql) => sql`select l.etapa, l.proximo_followup, m.origem, m.motivo from public.vendas_leads l
      join public.vendas_movimentos m on m.lead_id = l.id and m.para = 'sem_interesse' where l.nome = 'Uberaba B'`,
  );
  expect(fim).toEqual({
    etapa: 'sem_interesse',
    proximo_followup: null,
    origem: 'automatico',
    motivo: 'Sem resposta depois do Follow-up D+5',
  });
});
