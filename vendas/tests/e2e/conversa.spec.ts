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
    await sql`update public.vendas_leads set telefone_e164 = '+5534999990002' where id = ${l!.id}`;
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
  await expect(page.getByTestId('mensagem-ia')).toHaveValue(/Que bom que respondeu/);
  await expect(sugestao).toContainText('Respondeu');

  // continua lá depois de recarregar
  await page.reload();
  await expect(page.getByTestId('mensagem-ia')).toHaveValue(/Que bom que respondeu/);

  // gerar de novo substitui a pendente
  await page.getByLabel('O que o lead respondeu').fill('Não quero mais receber mensagens.');
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  await expect(page.getByTestId('aviso-nao-contatar')).toBeVisible();
  await expect(conversa.getByTestId('mensagem-ia')).toHaveValue(/não te mando mais/);

  await noBanco(async (sql) => {
    const linhas = await sql`select status, provedor, prompt_versao from public.vendas_sugestoes
      where lead_id = ${leadId} order by criado_em`;
    expect(linhas).toEqual([
      { status: 'descartada', provedor: 'simulado', prompt_versao: 'v2' },
      { status: 'pendente', provedor: 'simulado', prompt_versao: 'v2' },
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

test('edita, aprova e abre no WhatsApp: histórico, etapa e follow-up do copiloto', async ({
  page,
  context,
}) => {
  await entrarComoGui(page);
  await page.goto(`/leads/${leadId}`);
  await page.getByLabel('O que o lead respondeu').fill('Oi! Como funciona?');
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  const final = page.getByTestId('mensagem-ia');
  await expect(final).toHaveValue(/Que bom que respondeu/);

  await final.fill('Oi Carla! Te mostro em 2 minutos, posso te mandar um vídeo?');
  await expect(page.getByTestId('aviso-editada')).toBeVisible();
  // o teste não sai para a internet: o wa.me responde uma página vazia
  await context.route('https://wa.me/**', (r) => r.fulfill({ body: 'WhatsApp' }));
  const [whatsapp] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: 'Aprovar e abrir no WhatsApp' }).click(),
  ]);
  await whatsapp.waitForURL(/wa\.me\/5534999990002\?text=Oi%20Carla!/);
  await whatsapp.close();

  // a sugestão some e a conversa ganha as duas mensagens
  await expect(page.getByTestId('sugestao')).toHaveCount(0);
  const historico = page.getByTestId('historico');
  await expect(historico).toContainText('Oi! Como funciona?');
  await expect(historico).toContainText('posso te mandar um vídeo?');
  await expect(page.getByTestId('etapa-lead')).toContainText('Respondeu');
  await expect(page.getByTestId('historico-etapas')).toContainText('Copiloto');

  await noBanco(async (sql) => {
    const [s] = await sql`select status, editada, mensagem_final from public.vendas_sugestoes
      where lead_id = ${leadId}`;
    expect(s).toMatchObject({ status: 'aprovada', editada: true });
    const [m] = await sql`select de, para, origem from public.vendas_movimentos
      where lead_id = ${leadId} and origem = 'agente'`;
    expect(m).toEqual({ de: 'abordado', para: 'respondeu', origem: 'agente' });
    const [l] = await sql`select tentativas, resumo from public.vendas_leads where id = ${leadId}`;
    expect(l).toEqual({ tentativas: 0, resumo: '(simulado) Respondeu a abordagem.' });
  });
});

test('descartar tira a sugestão e não mexe no lead', async ({ page }) => {
  await entrarComoGui(page);
  await page.goto(`/leads/${leadId}`);
  await page.getByLabel('O que o lead respondeu').fill('Oi!');
  await page.getByRole('button', { name: 'Gerar resposta' }).click();
  await expect(page.getByTestId('sugestao')).toBeVisible();
  await page.getByRole('button', { name: 'Descartar' }).click();
  await expect(page.getByTestId('sugestao')).toHaveCount(0);
  await expect(page.getByTestId('etapa-lead')).toContainText('Abordado');
  await noBanco(async (sql) => {
    const [r] = await sql`select
      (select status from public.vendas_sugestoes where lead_id = ${leadId}) as status,
      (select count(*)::int from public.vendas_mensagens where lead_id = ${leadId}) as mensagens`;
    expect(r).toEqual({ status: 'descartada', mensagens: 1 });
  });
});
