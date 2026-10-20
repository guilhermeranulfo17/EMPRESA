import postgres from 'postgres';

/** Acesso direto ao banco local nos testes (arrumar dados e conferir o que foi gravado). */
export async function noBanco<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  const sql = postgres(
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:55322/postgres',
    { max: 1, onnotice: () => {} },
  );
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

export type LeadTeste = {
  nome: string;
  cidade?: string | null;
  uf?: string | null;
  digitos?: string | null;
  prioridade?: 'A' | 'B' | 'C' | null;
  segmento?: string | null;
  etapa?: string;
  proximoFollowup?: string | null;
  ultimoModelo?: string | null;
  dataEntrada?: string;
};

/** Cria um lead direto no banco (telefone e WhatsApp montados a partir dos dígitos). */
export async function criarLead(sql: postgres.Sql, l: LeadTeste): Promise<string> {
  const d = l.digitos ?? null;
  const telefone = d
    ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(d.length - 4)}`
    : null;
  const whatsapp = d && d.length === 11 ? `https://wa.me/55${d}` : null;
  const [r] = await sql`insert into public.vendas_leads
    (nome, cidade, uf, telefone, telefone_digitos, whatsapp, prioridade, segmento, etapa,
     proximo_followup, ultimo_modelo, data_entrada)
    values (${l.nome}, ${l.cidade ?? null}, ${l.uf ?? null}, ${telefone}, ${d}, ${whatsapp},
      ${l.prioridade ?? null}, ${l.segmento ?? null}, ${l.etapa ?? 'nao_contatado'},
      ${l.proximoFollowup ?? null}, ${l.ultimoModelo ?? null}, ${l.dataEntrada ?? '2026-10-01'})
    returning id`;
  return r!.id as string;
}

/** Banco limpo de leads e modelos com o texto padrão de teste. */
export async function limpar(sql: postgres.Sql) {
  await sql`delete from public.vendas_leads`;
  await sql`update public.vendas_ajustes set meta_diaria = 10`;
}
