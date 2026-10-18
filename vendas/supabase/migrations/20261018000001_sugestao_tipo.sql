-- Vendas Orkestra · Etapa 9: tipo da sugestão do copiloto.
--   resposta  = o Gui colou o que o lead respondeu (tentativas sem resposta zeram ao aprovar);
--   abordagem = primeira mensagem, gerada pela Fila do dia;
--   followup  = lead não respondeu, gerada pela Fila do dia (tentativas + 1 ao aprovar).
-- Aditiva: coluna com default, o código anterior continua funcionando.

alter table public.vendas_sugestoes
  add column tipo text not null default 'resposta'
  check (tipo in ('resposta', 'abordagem', 'followup'));
