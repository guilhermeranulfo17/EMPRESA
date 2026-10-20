# Prospecção Orkestra

O CRM de prospecção do Gui: o funil de vendas do Orkestra para buffets. Fica em
**`/admin/prospeccao`** e só o e-mail dele entra. É um app **separado** do Orkestra: banco, login e
deploy próprios. Não toca em nada do sistema do Orkestra nem dos clientes.

Feito para o celular, com uma mão: menu fixo embaixo (Hoje, Leads, Funil, Mensagens, Painel).

## As telas

| Tela                           | O que faz                                                                                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hoje** (`/admin/prospeccao`) | Meta do dia (X de 10 abordagens). Follow-ups que vencem hoje ou atrasados. Quem abordar: só Não contatado, uma cidade por vez (a que tem mais leads A primeiro), A antes de B antes de C. Cada cartão já traz a mensagem do modelo e o botão **Abrir no WhatsApp**. |
| **Leads**                      | Lista com busca e filtros (cidade, prioridade, segmento, etapa). Tocar no chip da etapa muda na hora. Botões para kanban, importar e novo lead.                                                                                                                     |
| **Lead**                       | Etapas com 1 toque, mandar mensagem por modelo, assistente de IA, histórico (etapas e mensagens) e dados do lead.                                                                                                                                                   |
| **Funil**                      | Kanban das 7 etapas (arrasta no PC; "Mover para" no celular).                                                                                                                                                                                                       |
| **Mensagens**                  | Os 5 modelos editáveis com `{nome}`, `{cidade}` e `{segmento}`. Atalhos para a base da IA, exemplos e Testar IA.                                                                                                                                                    |
| **Painel**                     | Metas (primeira venda em 1 mês, 10 clientes em 3 meses), funil, taxa de resposta, abordagens dos últimos 7 dias e números por cidade. Meta diária e data de início ajustáveis.                                                                                      |

## Regras

- **Etapas:** Não contatado, Mensagem 1 enviada, Follow-up enviado, Respondeu, Em teste, Fechou,
  Sem interesse. Toda mudança (à mão, pelo WhatsApp, pela IA, importação ou automática) vai para o
  histórico do lead.
- **Telefone único:** a comparação é só pelos dígitos (`(34) 99999-9999`, `+55 34 99999-9999` e
  `5534999999999` são o mesmo). O link `wa.me` só existe para celular; fixo tem "copiar e marcar
  enviada".
- **Cadência do botão do WhatsApp:**
  - Mensagem 1 → "Mensagem 1 enviada" e follow-up em 2 dias (D+2);
  - Follow-up D+2 → "Follow-up enviado" e próximo em 3 dias (D+5 contando da Mensagem 1);
  - Follow-up D+5 → prazo final em 3 dias; sem resposta até lá, vai sozinho para "Sem interesse"
    (acontece quando o Hoje, a lista, o funil ou o painel abrem);
  - respostas prontas ("quanto custa", "não tenho tempo") → "Respondeu" e novo contato em 2 dias;
  - quem já respondeu, está em teste ou fechou nunca volta de etapa por causa de um modelo.
- **Abordagem** (meta do dia e painel) = lead que entrou em "Mensagem 1 enviada" no dia, por
  qualquer caminho menos importação.

## Importar a lista

Colunas reconhecidas pelo nome, em qualquer ordem: `NOME DA EMPRESA`, `AVALIAÇÕES`, `CIDADE`,
`NUMERO`, `CATEGORIA DE NEGOCIO`, `WHATSAPP`, `SEGMENTO`, `PRIORIDADE`, `STATUS`, `ORIGEM` (também
`UF` e `OBSERVAÇÕES`). CSV (ponto e vírgula ou vírgula) e XLSX (primeira aba).

1. Leads → botão de importar (ou "Mais" → Importar planilha).
2. Escolha o arquivo no celular, **ou** coloque o `Lista_Orkestra.xlsx` na pasta `import/` (dentro
   de `vendas/` ou na raiz do repositório) e rode o app no computador: o arquivo aparece na tela.
3. Confira o resumo (novos, duplicados, com erro e avisos) e toque em **Gravar**.

A pasta `import/`, `*.xlsx` e `*.csv` estão no `.gitignore`: a lista tem telefones de pessoas
reais e o repositório é público. **Nunca commite a planilha.**

Cidade com UF junto ("Uberlândia - MG") é separada; sem UF, ela sai do DDD. Lead sem telefone
válido não entra. Quem vem da planilha com STATUS de mensagem enviada entra com follow-up para hoje.

## Assistente de IA

- No lead, cole a conversa do WhatsApp e toque em **Analisar com IA**. Volta: resumo em 2 linhas,
  etapa sugerida, próxima resposta e data do próximo follow-up. Você aceita (com ou sem abrir o
  WhatsApp), edita qualquer um dos três ou recusa.
- Quando você edita, a versão da IA e a sua ficam guardadas. As **5 últimas correções** entram em
  toda análise nova (mais os exemplos que você marcar como bons ou ruins).
- Claude da Anthropic, modelo `claude-sonnet-5-5`, chave em `ANTHROPIC_API_KEY`. Só roda no
  servidor. O contexto do Orkestra e o seu tom estão em `prompts/copiloto.v3.md`.
- **Testar IA** (no "Mais") mostra provedor, modelo e se a chave está configurada.

## Stack

Next.js 15 (App Router, Server Actions) + TypeScript, Supabase (Postgres e Auth), Drizzle,
Tailwind 4, Zod, Vitest e Playwright. pnpm e Node 22. Fontes Outfit e Plus Jakarta Sans
(next/font), cores do Orkestra (lima `#B2F858` e preto `#0B0B08`). Sem dependência nova: o XLSX é
lido com o zlib do Node.

## Segurança

- Login pelo Supabase Auth (e-mail e senha), sem cadastro público. Só entra quem está em
  `VENDAS_EMAILS`; quem não está recebe "E-mail ou senha incorretos.".
- Cada página e cada ação conferem o login. As tabelas só são lidas e escritas pelo servidor
  (`DATABASE_URL`); RLS ligado e nenhum privilégio para a chave pública do Supabase.
- Nenhuma chave no código. Tudo por variável de ambiente.

## Rodar localmente

Precisa de Node 22, pnpm 10 e Docker.

```bash
cd vendas
pnpm install
pnpm db:start                  # Supabase local nas portas 55321-55324
cp .env.example .env.local     # cole a anon key de `pnpm exec supabase status`
pnpm db:reset                  # tabelas + conta de teste (só local)
pnpm dev                       # http://localhost:3000/admin/prospeccao
```

Conta de teste: `gui@vendas.local` / `vendas12345`. Sem chave da Anthropic, use
`VENDAS_IA_PROVEDOR=simulado` (resposta fixa marcada como simulada).

## Colocar no ar (uma vez)

1. Crie um projeto no Supabase (plano grátis) e rode as migrations de `supabase/migrations`
   (`pnpm exec supabase link` e `pnpm exec supabase db push`). A migration
   `20261019000001_prospeccao` converte o que já existir (etapas antigas viram as novas) e cria os
   5 modelos com um texto inicial para você editar. Não cria nenhum lead.
2. Em Authentication → Users, crie o seu usuário (e-mail e senha). Desligue "Allow new users to sign up".
3. Na Vercel, importe o repositório com **Root Directory = `vendas`** e configure as variáveis do
   `.env.example` (valores do Supabase, o seu e-mail em `VENDAS_EMAILS` e `ANTHROPIC_API_KEY`).

## Comandos

| Comando                                            | O que faz                                                                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                         | App em http://localhost:3000                                                                                            |
| `pnpm build` / `pnpm start`                        | Build e servidor de produção                                                                                            |
| `pnpm lint` / `pnpm typecheck`                     | Qualidade                                                                                                               |
| `pnpm test`                                        | Testes das regras (Vitest)                                                                                              |
| `pnpm test:e2e`                                    | Playwright no tamanho de celular e de PC (precisa do Supabase local e do app rodando com `VENDAS_IA_PROVEDOR=simulado`) |
| `pnpm db:start` / `pnpm db:stop` / `pnpm db:reset` | Supabase local                                                                                                          |
