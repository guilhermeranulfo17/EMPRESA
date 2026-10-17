# Vendas Orkestra

CRM e copiloto de IA do Gui para vender o Orkestra, por prospecção ativa, para donos de buffet.
Sistema **separado** do Orkestra: banco, login e deploy próprios. Não toca em nada dos clientes.

Fase 1 (copiloto): o Gui cola a conversa do lead, o agente sugere a resposta e atualiza o
pipeline. Sem integração com WhatsApp (só o link `wa.me` com a mensagem pronta).

## Stack

Next.js 15 (App Router, Server Actions) + TypeScript, Supabase (Postgres e Auth), Drizzle,
Tailwind 4, Zod, Vitest e Playwright. pnpm e Node 22. Deploy sugerido: Vercel + Supabase (plano grátis).

## Segurança

- Login pelo Supabase Auth (e-mail e senha), sem cadastro público. Só entra quem está em
  `VENDAS_EMAILS`; quem não está recebe "E-mail ou senha incorretos.".
- As tabelas só são lidas e escritas pelo servidor (`DATABASE_URL`). RLS ligado e nenhum
  privilégio para a chave pública do Supabase.
- Nenhuma chave no código. Tudo por variável de ambiente.

## Rodar localmente

Precisa de Node 22, pnpm 10 e Docker.

```bash
cd vendas
pnpm install
pnpm db:start                  # Supabase local nas portas 55321-55324
cp .env.example .env.local     # cole a anon key de `pnpm exec supabase status`
pnpm db:reset                  # tabelas + conta de teste
pnpm dev                       # http://localhost:3000
```

Conta de teste: `gui@vendas.local` / `vendas12345`.

## Colocar no ar (uma vez)

1. Crie um projeto no Supabase (plano grátis) e rode as migrations de `supabase/migrations`
   (`pnpm exec supabase link` e `pnpm exec supabase db push`).
2. Em Authentication → Users, crie o seu usuário (e-mail e senha). Desligue "Allow new users to sign up".
3. Na Vercel, importe o repositório com **Root Directory = `vendas`** e configure as variáveis do
   `.env.example` (com os valores do projeto do Supabase e o seu e-mail em `VENDAS_EMAILS`).

## Comandos

| Comando                                            | O que faz                                               |
| -------------------------------------------------- | ------------------------------------------------------- |
| `pnpm dev`                                         | App em http://localhost:3000                            |
| `pnpm build` / `pnpm start`                        | Build e servidor de produção                            |
| `pnpm lint` / `pnpm typecheck`                     | Qualidade                                               |
| `pnpm test`                                        | Testes unitários                                        |
| `pnpm test:e2e`                                    | Playwright (precisa do Supabase local e do app rodando) |
| `pnpm db:start` / `pnpm db:stop` / `pnpm db:reset` | Supabase local                                          |
