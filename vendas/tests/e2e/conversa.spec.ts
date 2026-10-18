import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';
import { noBanco } from './banco';

/* Roda com o servidor em VENDAS_IA_PROVEDOR=simulado (resposta fixa, sem chave). */

let leadId = '';

test.beforeEach(async () => {
  await noBanco(async (sql) => {
    await sql`delete from public.vendas_leads`;
    const [l] = await sql`insert into public.vendas_leads (nome, buffet, etapa)
      values ('Carla Conversa', 'Buffet Lua', 'abordado') returning id`;
    leadId = l!.id;
    await sql`insert into public.vendas_mensagens (lead_id, autor, texto) values
      (${leadId}, 'gui', 'Oi Carla, vi o buffet de vocês no Instagram!')`;
    await sql`insert into public.vendas_leads (nome, nao_contatar) values ('Davi Parou', true)`;
  });
});

test('cola a resposta do lead, gera a sugestão e ela fica guardada', async ({ page }) => {
  await entrarComoGui(page);
  await page.goto(`/leads/${leadId}`);
  const conversa = page.getByTestId('conversa');
  await expect(page.getByTestId('historico')).toContainText('vi o buffet de vocês');

  // vazio não gera
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  await expect(page.getByTestId('erro-conversa')).toContainText('Cole a resposta do lead');

  await page.getByLabel('O que o lead respondeu').fill('Oi! Como funciona esse sistema?');
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  const sugestao = page.getByTestId('sugestao');
  await expect(sugestao).toContainText('Como funciona esse sistema?');
  await expect(page.getByTestId('mensagem-ia')).toContainText('Que bom que respondeu');
  await expect(sugestao).toContainText('Respondeu');

  // continua lá depois de recarregar
  await page.reload();
  await expect(page.getByTestId('mensagem-ia')).toContainText('Que bom que respondeu');

  // gerar de novo substitui a pendente
  await page.getByLabel('O que o lead respondeu').fill('Não quero mais receber mensagens.');
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  await expect(page.getByTestId('aviso-nao-contatar')).toBeVisible();
  await expect(conversa.getByTestId('mensagem-ia')).toContainText('não te mando mais');

  await noBanco(async (sql) => {
    const linhas = await sql`select status, provedor, prompt_versao from public.vendas_sugestoes
      where lead_id = ${leadId} order by criado_em`;
    expect(linhas).toEqual([
      { status: 'descartada', provedor: 'simulado', prompt_versao: 'v1' },
      { status: 'pendente', provedor: 'simulado', prompt_versao: 'v1' },
    ]);
  });
});

test('lead marcado como não contatar não recebe sugestão', async ({ page }) => {
  await entrarComoGui(page);
  await page.getByTestId('aba-Leads').click();
  await page.getByText('Davi Parou').click();
  await expect(page.getByTestId('conversa')).toContainText('não contatar');
  await expect(page.getByRole('button', { name: 'Gerar resposta' })).toHaveCount(0);
});
