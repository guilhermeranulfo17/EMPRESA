import { expect, test } from '@playwright/test';
import { entrarComoGui } from './apoio';
import { noBanco } from './banco';

/* Roda com o servidor em VENDAS_IA_PROVEDOR=simulado (resposta fixa, sem chave). */

const hoje = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const somar = (data: string, dias: number) => {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

test.beforeEach(async () => {
  const h = hoje();
  await noBanco(async (sql) => {
    await sql`delete from public.vendas_leads`;
    await sql`insert into public.vendas_leads
      (nome, buffet, cidade, etapa, telefone_e164, tentativas, proximo_followup, nao_contatar) values
      ('Nina Nova', 'Buffet Nina', 'Uberlândia', 'novo', '+5534999990011', 0, null, false),
      ('Otto Atrasado', 'Buffet Otto', 'Araguari', 'abordado', '+5534999990012', 1, ${somar(h, -2)}, false),
      ('Edu Encerrar', 'Buffet Edu', null, 'abordado', null, 3, ${h}, false),
      ('Fábio Futuro', null, null, 'abordado', null, 1, ${somar(h, 3)}, false),
      ('Pedro Parou', null, null, 'novo', null, 0, null, true)`;
  });
});

test('fila mostra quem chamar hoje, gera abordagem e follow-up e encerra quem não responde', async ({
  page,
}) => {
  await entrarComoGui(page);
  await expect(page.getByTestId('resumo-fila')).toContainText(
    '1 atrasados · 1 novos · 1 para encerrar',
  );
  const itens = page.getByTestId('item-fila');
  await expect(itens).toHaveCount(3);
  await expect(itens.nth(0)).toContainText('Otto Atrasado');
  await expect(itens.nth(0)).toContainText('Follow-up atrasado há 2 dias');
  await expect(itens.nth(1)).toContainText('Nina Nova');
  await expect(itens.nth(2)).toContainText('Edu Encerrar');
  await expect(page.getByTestId('fila')).not.toContainText('Fábio Futuro');
  await expect(page.getByTestId('fila')).not.toContainText('Pedro Parou');

  // abordagem do lead novo: gera direto da fila, sem travessão, e aprova
  const nina = itens.filter({ hasText: 'Nina Nova' });
  await nina.getByRole('button', { name: 'Gerar abordagem' }).click();
  await expect(nina.getByTestId('sugestao')).toContainText('Primeira abordagem');
  const msg = nina.getByTestId('mensagem-ia');
  await expect(msg).toHaveValue(/Vi o buffet de vocês/);
  await expect(msg).not.toHaveValue(/—/);
  await nina.getByRole('button', { name: 'Só aprovar' }).click();
  await expect(page.getByTestId('fila')).not.toContainText('Nina Nova');

  // follow-up do atrasado
  const otto = itens.filter({ hasText: 'Otto Atrasado' });
  await otto.getByRole('button', { name: 'Gerar follow-up' }).click();
  await expect(otto.getByTestId('sugestao')).toContainText('Follow-up');
  await otto.getByRole('button', { name: 'Só aprovar' }).click();
  await expect(page.getByTestId('fila')).not.toContainText('Otto Atrasado');

  // encerrar
  await itens
    .filter({ hasText: 'Edu Encerrar' })
    .getByRole('button', { name: /Encerrar/ })
    .click();
  await expect(page.getByText('Nada na fila hoje')).toBeVisible();

  await noBanco(async (sql) => {
    const linhas = await sql`select nome, etapa, tentativas, proximo_followup::text as f
      from public.vendas_leads where nome in ('Nina Nova', 'Otto Atrasado', 'Edu Encerrar')
      order by nome`;
    expect(linhas).toEqual([
      { nome: 'Edu Encerrar', etapa: 'perdido', tentativas: 3, f: hoje() },
      { nome: 'Nina Nova', etapa: 'abordado', tentativas: 1, f: somar(hoje(), 3) },
      { nome: 'Otto Atrasado', etapa: 'abordado', tentativas: 2, f: somar(hoje(), 3) },
    ]);
    // abordagem e follow-up: só a mensagem do Gui entra no histórico
    const autores = await sql`select m.autor, s.tipo from public.vendas_mensagens m
      join public.vendas_sugestoes s on s.id = m.sugestao_id order by s.tipo`;
    expect(autores).toEqual([
      { autor: 'gui', tipo: 'abordagem' },
      { autor: 'gui', tipo: 'followup' },
    ]);
    const [mov] = await sql`select m.de, m.para, m.origem from public.vendas_movimentos m
      join public.vendas_leads l on l.id = m.lead_id where l.nome = 'Nina Nova'`;
    expect(mov).toEqual({ de: 'novo', para: 'abordado', origem: 'agente' });
  });
});

test('no lead com 3 tentativas não há botão de follow-up', async ({ page }) => {
  await entrarComoGui(page);
  await page.getByTestId('aba-Leads').click();
  // o mesmo nome aparece na Fila (tela inicial): só clica depois que a lista de leads abriu
  await expect(page.getByTestId('lista-leads')).toBeVisible();
  await page.getByTestId('lista-leads').getByText('Edu Encerrar').click();
  await expect(page.getByTestId('conversa')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gerar follow-up' })).toHaveCount(0);
  await page.goto('/leads');
  await page.getByText('Otto Atrasado').click();
  await expect(page.getByRole('button', { name: 'Gerar follow-up' })).toBeVisible();
});
