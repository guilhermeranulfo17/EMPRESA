-- A inscrição do Experience passa a perguntar só "tem 18 anos ou mais?": a idade exata deixa de ser obrigatória.
alter table public.enrollments alter column age drop not null;
