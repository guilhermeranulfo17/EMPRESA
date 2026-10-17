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
