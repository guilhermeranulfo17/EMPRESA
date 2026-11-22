-- Inscrições (lista de espera) do Outside Experience.
-- Só o servidor (função outside-api, com a chave de serviço) lê e escreve: RLS ligado e sem políticas.

create table public.editions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 80),
  date_label text not null default 'Em breve' check (char_length(date_label) between 1 and 60),
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- no máximo uma edição recebendo inscrições
create unique index editions_one_current on public.editions (is_current) where is_current;

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  whatsapp text not null check (char_length(whatsapp) between 10 and 20),
  whatsapp_digits text not null check (whatsapp_digits ~ '^[0-9]{10,11}$'),
  age smallint not null check (age between 5 and 120),
  church text not null check (char_length(church) between 2 and 120),
  is_minor boolean not null,
  guardian_consent boolean not null default false,
  ticket_code text not null unique,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  origem jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint minor_needs_consent check (not is_minor or guardian_consent),
  constraint one_per_whatsapp unique (edition_id, whatsapp_digits)
);

create index enrollments_edition_idx on public.enrollments (edition_id, created_at desc);

alter table public.editions enable row level security;
alter table public.enrollments enable row level security;

-- a próxima edição já começa recebendo inscrições
insert into public.editions (slug, name, date_label, is_current)
values ('2a-edicao', '2ª edição', 'Em breve', true);
