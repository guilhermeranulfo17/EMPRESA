-- Dados de desenvolvimento (só local; nunca rode em produção).
-- Conta de teste: gui@vendas.local / vendas12345 (coloque o e-mail em VENDAS_EMAILS).

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000', '9a000000-0000-4000-8000-000000000001', 'authenticated',
  'authenticated', 'gui@vendas.local', extensions.crypt('vendas12345', extensions.gen_salt('bf')),
  now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"nome": "Gui"}'::jsonb,
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select u.id, u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u where u.id = '9a000000-0000-4000-8000-000000000001'
on conflict do nothing;

-- Uma conta que NÃO está em VENDAS_EMAILS, para conferir que o login recusa.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000', '9a000000-0000-4000-8000-000000000002', 'authenticated',
  'authenticated', 'intruso@vendas.local', extensions.crypt('vendas12345', extensions.gen_salt('bf')),
  now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{}'::jsonb,
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select u.id, u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u where u.id = '9a000000-0000-4000-8000-000000000002'
on conflict do nothing;
