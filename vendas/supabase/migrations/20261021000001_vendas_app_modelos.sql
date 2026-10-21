-- Em produção o app entra com o papel "vendas_app" (criado à mão, só com acesso às tabelas de
-- vendas). As tabelas novas da prospecção e a busca sem acento precisam do mesmo acesso.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'vendas_app') then
    grant select, insert, update, delete on public.vendas_modelos, public.vendas_ajustes to vendas_app;
    grant usage on schema extensions to vendas_app;
  end if;
end;
$$;
