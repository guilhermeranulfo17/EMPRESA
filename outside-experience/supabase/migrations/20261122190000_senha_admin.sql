-- Senha do painel /admin guardada só como hash (sha256 com sal), e trava contra tentativas em massa.
-- Para trocar a senha (no SQL Editor do Supabase):  select public.set_admin_password('nova-senha');

create table public.admin_config (
  id boolean primary key default true check (id),
  password_salt bytea not null,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

create table public.admin_login_failures (
  at timestamptz not null default now()
);
create index admin_login_failures_at_idx on public.admin_login_failures (at);

alter table public.admin_config enable row level security;
alter table public.admin_login_failures enable row level security;

create or replace function public.set_admin_password(nova text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  sal bytea := extensions.gen_random_bytes(16);
begin
  if char_length(nova) < 6 then
    raise exception 'A senha precisa ter pelo menos 6 caracteres';
  end if;
  insert into public.admin_config (id, password_salt, password_hash, updated_at)
  values (true, sal, encode(extensions.digest(sal || convert_to(nova, 'UTF8'), 'sha256'), 'hex'), now())
  on conflict (id) do update
    set password_salt = excluded.password_salt, password_hash = excluded.password_hash, updated_at = now();
  delete from public.admin_login_failures;
end;
$$;

revoke all on function public.set_admin_password(text) from public, anon, authenticated;
