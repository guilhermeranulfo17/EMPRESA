-- Candidaturas da Outside School (formação on-line de 4 semanas).
-- Só a função outside-api (chave de serviço) lê e escreve: RLS ligado e sem políticas.

create table if not exists public.school_applications (
  id uuid primary key default gen_random_uuid(),
  turma text not null default 'proxima' check (char_length(turma) between 1 and 40),
  name text not null check (char_length(name) between 2 and 120),
  whatsapp text not null check (char_length(whatsapp) between 10 and 20),
  whatsapp_digits text not null check (whatsapp_digits ~ '^[0-9]{10,11}$'),
  email text check (email is null or char_length(email) between 5 and 160),
  age smallint not null check (age between 14 and 120),
  city text not null check (char_length(city) between 2 and 120),
  church text not null check (char_length(church) between 2 and 120),
  pastor_name text not null check (char_length(pastor_name) between 2 and 120),
  pastor_contact text not null check (char_length(pastor_contact) between 5 and 160),
  motivation text not null check (char_length(motivation) between 10 and 1500),
  status text not null default 'nova' check (status in ('nova', 'em análise', 'aprovada', 'lista de espera', 'não aprovada')),
  origem jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint school_one_per_whatsapp unique (turma, whatsapp_digits)
);

create index if not exists school_applications_created_idx on public.school_applications (created_at desc);

alter table public.school_applications enable row level security;
