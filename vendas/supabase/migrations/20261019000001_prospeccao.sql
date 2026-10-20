-- Vendas Orkestra · CRM de prospecção (/admin/prospeccao).
--
-- 1. Etapas novas do funil: Não contatado, Mensagem 1 enviada, Follow-up enviado, Respondeu,
--    Em teste, Fechou e Sem interesse. As antigas viram:
--      novo → nao_contatado; abordado → mensagem_1 (ou followup se já teve mais de 1 tentativa);
--      respondeu e interessado → respondeu; fechando → em_teste; cliente → fechou;
--      perdido → sem_interesse.
-- 2. Campos novos do lead (UF, WhatsApp, categoria, segmento, prioridade, avaliações, data de
--    entrada, observações). Telefone passa a ser texto "(34) 99999-9999", único pelos dígitos.
--    "buffet" deixa de existir: o nome do lead é o nome da empresa (o nome antigo da pessoa vai
--    para as observações). "tentativas" sai: a cadência agora é pela etapa e pelo último modelo.
-- 3. Modelos de mensagem editáveis e os ajustes das metas.
--
-- Nada de lead de exemplo: só a estrutura, os 5 modelos (texto inicial para editar) e os ajustes.

-- ---------------------------------------------------------------------------
-- 1. etapas
-- ---------------------------------------------------------------------------
create type public.vendas_etapa_nova as enum (
  'nao_contatado', 'mensagem_1', 'followup', 'respondeu', 'em_teste', 'fechou', 'sem_interesse'
);

create function pg_temp.etapa_nova(etapa text, tentativas integer)
returns public.vendas_etapa_nova
language sql
immutable
as $$
  select (case etapa
    when 'novo' then 'nao_contatado'
    when 'abordado' then case when coalesce(tentativas, 0) > 1 then 'followup' else 'mensagem_1' end
    when 'respondeu' then 'respondeu'
    when 'interessado' then 'respondeu'
    when 'fechando' then 'em_teste'
    when 'cliente' then 'fechou'
    when 'perdido' then 'sem_interesse'
  end)::public.vendas_etapa_nova
$$;

drop index public.vendas_leads_etapa_idx;
drop index public.vendas_leads_followup_idx;
alter table public.vendas_leads alter column etapa drop default;
alter table public.vendas_leads
  alter column etapa type public.vendas_etapa_nova
  using pg_temp.etapa_nova(etapa::text, tentativas::integer);

-- "respondeu → interessado" vira "respondeu → respondeu": a linha do histórico fica, a regra
-- volta a valer só para os movimentos novos
alter table public.vendas_movimentos drop constraint vendas_movimentos_check;
alter table public.vendas_movimentos
  alter column de type public.vendas_etapa_nova using pg_temp.etapa_nova(de::text, 0),
  alter column para type public.vendas_etapa_nova using pg_temp.etapa_nova(para::text, 0);
alter table public.vendas_movimentos
  add constraint vendas_movimentos_check check (de is distinct from para) not valid;

update public.vendas_sugestoes
set saida = jsonb_set(saida, '{etapa}', to_jsonb(pg_temp.etapa_nova(saida->>'etapa', 0)::text))
where saida ? 'etapa' and saida->>'etapa' in
  ('novo', 'abordado', 'respondeu', 'interessado', 'fechando', 'cliente', 'perdido');

drop type public.vendas_etapa;
alter type public.vendas_etapa_nova rename to vendas_etapa;
alter table public.vendas_leads alter column etapa set default 'nao_contatado';

-- novas origens de movimento: envio de modelo pelo WhatsApp e encerramento automático
alter type public.vendas_origem_movimento add value 'mensagem';
alter type public.vendas_origem_movimento add value 'automatico';

-- ---------------------------------------------------------------------------
-- 2. lead
-- ---------------------------------------------------------------------------
-- busca sem acento na lista de leads ("sao jose" acha "São José")
create extension if not exists unaccent with schema extensions;

alter table public.vendas_leads
  add column uf text check (uf is null or uf ~ '^[A-Z]{2}$'),
  add column telefone text check (telefone is null or char_length(telefone) <= 40),
  -- só os dígitos (DDD + número, sem o 55): é o que garante que o mesmo telefone não entra 2 vezes
  add column telefone_digitos text check (telefone_digitos is null or telefone_digitos ~ '^[0-9]{8,15}$'),
  -- link wa.me, só quando o telefone é celular
  add column whatsapp text check (whatsapp is null or whatsapp ~ '^https://wa\.me/[0-9]{10,15}$'),
  add column categoria text check (categoria is null or char_length(categoria) <= 120),
  add column segmento text check (segmento is null or segmento in
    ('buffet_infantil', 'buffet_catering', 'espaco_eventos', 'doces')),
  add column prioridade text check (prioridade is null or prioridade in ('A', 'B', 'C')),
  add column avaliacoes text check (avaliacoes is null or char_length(avaliacoes) <= 40),
  add column data_entrada date not null default (now() at time zone 'America/Sao_Paulo')::date,
  add column observacoes text check (observacoes is null or char_length(observacoes) <= 4000),
  -- último modelo mandado pelo botão do WhatsApp (decide o próximo passo da cadência)
  add column ultimo_modelo text check (ultimo_modelo is null or ultimo_modelo in
    ('mensagem_1', 'followup_2', 'followup_5', 'quanto_custa', 'sem_tempo'));

update public.vendas_leads l
set telefone_digitos = d.digitos,
    telefone = case
      when d.br and length(d.digitos) = 11
        then '(' || substr(d.digitos, 1, 2) || ') ' || substr(d.digitos, 3, 5) || '-' || substr(d.digitos, 8, 4)
      when d.br and length(d.digitos) = 10
        then '(' || substr(d.digitos, 1, 2) || ') ' || substr(d.digitos, 3, 4) || '-' || substr(d.digitos, 7, 4)
      else l.telefone_e164
    end,
    whatsapp = case
      when d.br and length(d.digitos) = 11 and substr(d.digitos, 3, 1) = '9'
        then 'https://wa.me/55' || d.digitos
    end
from (
  select id,
         telefone_e164 like '+55%' as br,
         case when telefone_e164 like '+55%' then substr(telefone_e164, 4)
              else substr(telefone_e164, 2) end as digitos
  from public.vendas_leads
  where telefone_e164 is not null
) d
where d.id = l.id;

update public.vendas_leads
set data_entrada = (criado_em at time zone 'America/Sao_Paulo')::date;

-- o nome passa a ser o da empresa; o nome da pessoa fica guardado nas observações
update public.vendas_leads
set observacoes = 'Contato: ' || nome,
    nome = left(btrim(buffet), 120)
where buffet is not null and char_length(btrim(buffet)) >= 2 and btrim(buffet) <> btrim(nome);

drop index public.vendas_leads_telefone_idx;
alter table public.vendas_leads
  drop column buffet,
  drop column telefone_e164,
  drop column tentativas;

create unique index vendas_leads_telefone_idx on public.vendas_leads (telefone_digitos)
  where telefone_digitos is not null;
create index vendas_leads_etapa_idx on public.vendas_leads (etapa, atualizado_em desc);
create index vendas_leads_followup_idx on public.vendas_leads (proximo_followup)
  where not nao_contatar and etapa not in ('fechou', 'sem_interesse');
create index vendas_leads_cidade_idx on public.vendas_leads (cidade, uf);
create index vendas_movimentos_dia_idx on public.vendas_movimentos (para, criado_em desc);

-- o que o Gui decidiu numa sugestão da IA (etapa e follow-up finais), ao lado da saída original
alter table public.vendas_sugestoes add column final jsonb;

-- ---------------------------------------------------------------------------
-- 3. modelos de mensagem e ajustes
-- ---------------------------------------------------------------------------
create table public.vendas_modelos (
  chave          text primary key check (chave in
                   ('mensagem_1', 'followup_2', 'followup_5', 'quanto_custa', 'sem_tempo')),
  texto          text not null check (char_length(btrim(texto)) between 1 and 2000),
  atualizado_em  timestamptz not null default now()
);

create trigger vendas_modelos_atualizado_em
  before update on public.vendas_modelos
  for each row execute function public.tocar_atualizado_em();

-- texto inicial de cada modelo, para o Gui editar na aba Mensagens
insert into public.vendas_modelos (chave, texto) values
  ('mensagem_1', 'Oi, tudo bem? Aqui é o Gui. Vi o {nome} aí em {cidade} e fiz uma coisa que pode te ajudar: um orçamento interativo para buffet. O cliente monta a festa sozinho e recebe o valor na hora, sem você precisar responder "quanto custa" o dia todo. Posso te mandar o link para você ver como fica?'),
  ('followup_2', 'Oi, passando aqui de novo. Conseguiu ver minha mensagem? Se quiser, te mando o link para você ver como o cliente monta a festa e já recebe o valor.'),
  ('followup_5', 'Oi, essa é minha última mensagem para não te encher. Se um dia quiser parar de responder orçamento um por um, é só me chamar aqui. Abraço!'),
  ('quanto_custa', 'Fica em torno de R$ 250 por mês. O cliente monta a festa pelo link, recebe o valor na hora e você só entra quando ele quer fechar. Quer que eu te mostre como fica com o {nome}?'),
  ('sem_tempo', 'Entendo, e é justamente para isso. A ideia é você parar de perder tempo respondendo orçamento. Te mando o link para você olhar quando tiver um tempinho?');

create table public.vendas_ajustes (
  id             boolean primary key default true check (id),
  meta_diaria    smallint not null default 10 check (meta_diaria between 1 and 200),
  -- início da contagem das metas (primeira venda em 1 mês, 10 clientes em 3 meses)
  inicio_metas   date not null default (now() at time zone 'America/Sao_Paulo')::date,
  atualizado_em  timestamptz not null default now()
);

create trigger vendas_ajustes_atualizado_em
  before update on public.vendas_ajustes
  for each row execute function public.tocar_atualizado_em();

insert into public.vendas_ajustes default values;

do $$
declare
  t text;
begin
  foreach t in array array['vendas_modelos', 'vendas_ajustes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end;
$$;
